'use strict';
/** @namespace drivers.motion */

const Point = Mep.require('misc/Point');
const EventEmitter = require('events');
const Buffer = require('buffer').Buffer;

const TAG = 'MotionDriver';

/**
 * Driver enables communication with Memristor's motion driver.
 * @memberof drivers.motion
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 * @fires MotionDriver#positionChanged
 * @fires MotionDriver#orientationChanged
 * @fires MotionDriver#stateChanged
 */
class MotionDriver extends EventEmitter  {
    static get DIRECTION_FORWARD() { return 1; }
    static get DIRECTION_BACKWARD() { return -1; }
    static get STATE_IDLE() { return 1; }
    static get STATE_STUCK() { return 2; }
    static get STATE_MOVING() { return 3; }
    static get STATE_ROTATING() { return 4; }
    static get STATE_ERROR() { return 5; }
    static get STATE_UNDEFINED() { return 6; }

    /**
     * @param name {String} - Unique driver name
     * @param config {Object} - Configuration presented as an associative array
     */
    constructor(name, config) {
        super();

        this.name = name;
        this.config = Object.assign({
            startX: -1300,
            startY: 0,
            startOrientation: 0,
            startSpeed: 100,
            refreshDataPeriod: 100,
            connectionTimeout: 500
        }, config);

        this.positon = new Point(config.startX, config.startY);
        this.direction = MotionDriver.DIRECTION_FORWARD;
        this.state = MotionDriver.STATE_UNDEFINED;
        this.stateChar = 'U';
        this.orientation = config.startOrientation;

        this.communicator = Mep.DriverManager.getDriver(config['@dependencies'].communicator);
        this.communicator.on('data', this._onDataReceived.bind(this));
    }

    init(finishedCallback) {
        let motionDriver = this;

        this.setPositionAndOrientation(
            this.config.startX,
            this.config.startY,
            this.config.startOrientation
        );
        this.requestRefreshData();


        setTimeout(() => {
            if (motionDriver.getState() === MotionDriver.STATE_UNDEFINED) {
                throw Error(TAG, 'No response from motion driver');
            } else {
                Mep.Log.info(TAG, 'Communication is validated');
            }
            finishedCallback();
        }, this.config.connectionTimeout);
    }

    finishCommand(callback) {
        this.communicator.send(Buffer.from(['i'.charCodeAt(0)]), callback);
        Mep.Log.debug(TAG, 'Finish command sent');
    }

    /**
     * Request state, position and orientation from motion driver
     */
    requestRefreshData() {
        this.communicator.send(Buffer.from(['P'.charCodeAt(0)]));
    }

    /**
     * Reset position and orientation
     * @param x {Number} - New X coordinate relative to start position of the robot
     * @param y {Number} - New Y coordinate relative to start position of the robot
     * @param orientation {Number} - New robot's orientation
     */
    setPositionAndOrientation(x, y, orientation) {
        let data = Buffer.from([
            'I'.charCodeAt(0),
            x >> 8,
            x & 0xFF,
            y >> 8,
            y & 0xFF,
            orientation >> 8,
            orientation & 0xFF
        ]);

        this.communicator.send(data);
    }

    rotateTo(angle) {
        let data = Buffer.from([
            'A'.charCodeAt(0),
            angle >> 8,
            angle & 0xFF
        ]);
        this.communicator.send(data);
    }

    /**
     * Stop the robot.
     * @method stop
     * @memberof MotionDriver#
     */
    stop() {
        this.communicator.send('S');
    }

    /**
     * Stop robot by turning off motors.
     * @method softStop
     * @memberof MotionDriver#
     */
    softStop() {
        this.communicator.send('s');
    }


    /**
     * Set default speed of the robot
     * @method setSpeed
     * @memberof MotionDriver#
     * @param speed {Number} - Speed (0 - 255)
     */
    setSpeed(speed) {
        this.communicator.send(Buffer.from([
            'V'.charCodeAt(0),
            speed
        ]));
    }

    /**
     * Move robot to the absolute position
     * @method moveToPosition
     * @memberof MotionDriver#
     * @param positionX {Number} - X coordinate relative to start position of the robot
     * @param positionY {Number} - Y coordinate relative to start position of the robot
     * @param direction {Number} - Direction, can be MotionDriver.DIRECTION_FORWARD or MotionDriver.DIRECTION_BACKWARD
     */
    moveToPosition(x, y, direction) {
        this.communicator.send(Buffer.from([
            'G'.charCodeAt(0),
            x >> 8,
            x & 0xff,
            y >> 8,
            y & 0xff,
            0,
            direction
        ]));
    }

    moveToCurvilinear(x, y, direction) {
        this.communicator.send(Buffer.from([
            'N'.charCodeAt(0),
            x >> 8,
            x & 0xff,
            y >> 8,
            y & 0xff,
            direction
        ]));
    }


    _charToState(char) {
        let states = {
            'I': MotionDriver.STATE_IDLE,
            'M': MotionDriver.STATE_MOVING,
            'R': MotionDriver.STATE_ROTATING,
            'S': MotionDriver.STATE_STUCK,
            'E': MotionDriver.STATE_ERROR
        };
        if (states[char] !== undefined) {
            return states[char];
        }
        return MotionDriver.STATE_UNDEFINED;
    }

    _onDataReceived(buffer, type) {
        if (buffer.length < 9) return;

        // Ignore garbage
        let stateChar = String.fromCharCode(buffer.readInt8(0));
        let position = new Point(
            (buffer.readInt8(1) << 8) | (buffer.readInt8(2) & 0xFF),
            (buffer.readInt8(3) << 8) | (buffer.readInt8(4) & 0xFF)
        );
        let orientation = (buffer.readInt8(5) << 8) | (buffer.readInt8(6) & 0xFF);
        let speed = (buffer.readInt8(6) << 8) | (buffer.readInt8(7) & 0xFF);

        Mep.Telemetry.send(TAG, 'Speed', {speed: speed});

        if (this.positon.equals(position) === false) {
            this.positon = position;

            /**
             * Position changed event.
             * @event MotionDriver#positionChanged
             * @property {String} driverName - Unique name of a driver
             * @property {Point} point - Position of the robot
             */
            this.emit('positionChanged',
                this.name,
                this.positon,
                this.config.precision
            );
        }

        // If state is changed
        if (stateChar !== this.stateChar) {
            this.stateChar = stateChar;
            this.state = this._charToState(stateChar);

            /**
             * State change event.
             * @event MotionDriver#stateChanged
             * @property {Number} state - New state
             */
            this.emit('stateChanged', this.name, this.state);
        }

        if (orientation !== this.orientation) {
            this.orientation = orientation;

            /**
             * Orientation change event.
             * @event MotionDriver#orientationChanged
             * @property {String} driverName - Unique name of a driver
             * @property {Number} orientation - New orientation
             */
            this.emit('orientationChanged',
                this.name,
                orientation,
                this.config.precision
            );
        }

        // Read data again
        setInterval(this.requestRefreshData.bind(this), this.config.refreshDataPeriod);
    }

    /**
     * Get position of the robot
     * @return {Point} - Position of the robot
     */
    getPosition() {
        return this.positon;
    }

    getDirection() {
        return this.direction;
    }

    getState() {
        return this.state;
    }

    getGroups() {
        return ['position'];
    }

    getOrientation() {
        return this.orientation;
    }
}

module.exports = MotionDriver;