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
 * @fires drivers.motion.MotionDriver#positionChanged
 * @fires drivers.motion.MotionDriver#orientationChanged
 * @fires drivers.motion.MotionDriver#stateChanged
 */
class MotionDriver extends EventEmitter  {
    static get STATE_IDLE() { return 'I'.charCodeAt(0); }
    static get STATE_STUCK() { return 'S'.charCodeAt(0); }
    static get STATE_MOVING() { return 'M'.charCodeAt(0); }
    static get STATE_ROTATING() { return 'R'.charCodeAt(0); }
    static get STATE_ERROR() { return 'E'.charCodeAt(0); }
    static get STATE_UNDEFINED() { return 'U'.charCodeAt(0); }
    static get STATE_BREAK() { return 'B'.charCodeAt(0); }

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
            connectionTimeout: 4000,
            ackTimeout: 300
        }, config);

        this.positon = new Point(config.startX, config.startY);
        this.state = MotionDriver.STATE_UNDEFINED;
        this.orientation = config.startOrientation;
        this._activeSpeed = config.startSpeed;

        this.communicator = Mep.DriverManager.getDriver(config['@dependencies'].communicator);
        this.communicator.on('data', this._onDataReceived.bind(this));

        this._waitACKQueue = {};
    }

    _waitACK(type) {
        let motionDriver = this;

        setTimeout(() => {
            if (this._waitACKQueue[type] !== undefined) {
                Mep.Log.error(TAG, 'Error sending a command');
                motionDriver._sendCommand(this._waitACKQueue[type]);
            }
        }, this.config.ackTimeout);
    }

    _sendCommand(buff) {
        let type = buff.readUInt8(0);

        this._waitACKQueue[type] = buff;
        this._waitACK(type);

        this.communicator.send(buff);
    }

    /**
     * Check driver by checking checking communication with motion driver board
     */
    init() {
        let motionDriver = this;

        this.reset();
        this.setPositionAndOrientation(
            this.config.startX,
            this.config.startY,
            this.config.startOrientation
        );
        this.setRefreshInterval(this.config.refreshDataPeriod);
        this.requestRefreshData();

        return new Promise((resolve) => {
            let driverChecker = setInterval(() => {
                if (motionDriver.getState() !== MotionDriver.STATE_UNDEFINED) {
                    clearInterval(driverChecker);
                    Mep.Log.info(TAG, 'Communication is validated');
                    resolve();
                }
            }, 100);
            setTimeout(() => {
                if (motionDriver.getState() === MotionDriver.STATE_UNDEFINED) {
                    throw Error(TAG, 'No response from motion driver');
                }
            }, this.config.connectionTimeout);
        })
    }

    /**
     * Finish `moveToCurvilinear` command and prepare robot for another one
     */
    finishCommand() {
        this._sendCommand(Buffer.from(['i'.charCodeAt(0)]));
        Mep.Log.debug(TAG, 'Finish command sent');
    }

    /**
     * Reset all settings in motion driver
     */
    reset() {
        this._sendCommand(Buffer.from(['R'.charCodeAt(0)]));
    }

    /**
     * Request state, position and orientation from motion driver
     */
    requestRefreshData() {
        this._sendCommand(Buffer.from(['P'.charCodeAt(0)]));
    }

    /**
     * Reset position and orientation
     * @param x {Number} - New X coordinate relative to start position of the robot
     * @param y {Number} - New Y coordinate relative to start position of the robot
     * @param orientation {Number} - New robot's orientation
     */
    setPositionAndOrientation(x, y, orientation) {
        this._sendCommand(Buffer.from([
            'I'.charCodeAt(0),
            x >> 8,
            x & 0xFF,
            y >> 8,
            y & 0xFF,
            orientation >> 8,
            orientation & 0xFF
        ]));
    }

    /**
     * Rotate robot to given angle
     * @param angle {Number} - Angle
     */
    rotateTo(angle) {
        Mep.Log.debug(TAG, 'Rotate to:', angle);
        this._sendCommand(Buffer.from([
            'A'.charCodeAt(0),
            angle >> 8,
            angle & 0xFF
        ]));
    }

    /**
     * Move robot forward or backward depending on sign
     * @param millimeters
     * @deprecated
     */
    goForward(millimeters) {
        this._sendCommand(Buffer.from([
            'D'.charCodeAt(0),
            millimeters >> 8,
            millimeters & 0xFF,
            0
        ]));
    }

    /**
     * Stop the robot.
     */
    stop() {
        this._sendCommand(Buffer.from(['S'.charCodeAt(0)]));
    }

    /**
     * Stop robot by turning off motors.
     */
    softStop() {
        this._sendCommand(Buffer.from(['s'.charCodeAt(0)]));
    }

    /**
     * Set required refresh interval of robot status. Note that it is required
     * refresh interval and robot can choose to send or not depending on it's state.
     * @param interval {Number} - Period in milliseconds
     */
    setRefreshInterval(interval) {
        this._sendCommand(Buffer.from([
            'p'.charCodeAt(0),
            interval >> 8,
            interval & 0xff,
        ]));
    }


    /**
     * Set default speed of the robot
     * @param speed {Number} - Speed (0 - 255)
     */
    setSpeed(speed) {
        this._activeSpeed = speed;
        this._sendCommand(Buffer.from([
            'V'.charCodeAt(0),
            speed
        ]));
    }

    /**
     * Move robot to absolute position
     * @param position {misc.Point} - Required position of the robot
     * @param direction {Number} - Direction, can be MotionDriver.DIRECTION_FORWARD or
     * MotionDriver.DIRECTION_BACKWARD
     */
    moveToPosition(position, direction) {
        this._sendCommand(Buffer.from([
            'G'.charCodeAt(0),
            position.getX() >> 8,
            position.getX() & 0xff,
            position.getY() >> 8,
            position.getY() & 0xff,
            0,
            direction
        ]));
    }

    /**
     * Move robot to absolute position but robot make curves to speed up motion. This
     * command requires `finishCommand()` before next motion command.
     * @param position {misc.Point} - Required position of the robot
     * @param direction {Number} - Direction, can be MotionDriver.DIRECTION_FORWARD or
     * MotionDriver.DIRECTION_BACKWARD
     */
    moveToCurvilinear(position, direction) {
        this._sendCommand(Buffer.from([
            'N'.charCodeAt(0),
            position.getX() >> 8,
            position.getX() & 0xff,
            position.getY() >> 8,
            position.getY() & 0xff,
            direction
        ]));
    }

    /**
     * Packet type P is received
     * @param buffer {Buffer} - Payload
     * @private
     */
    _onPReceived(buffer) {
        // Ignore garbage
        let state = buffer.readInt8(0);
        let position = new Point(
            (buffer.readInt8(1) << 8) | (buffer.readInt8(2) & 0xFF),
            (buffer.readInt8(3) << 8) | (buffer.readInt8(4) & 0xFF)
        );
        let orientation = (buffer.readInt8(5) << 8) | (buffer.readInt8(6) & 0xFF);
        let speed = (buffer.readInt8(7) << 8) | (buffer.readInt8(8) & 0xFF);

        Mep.Telemetry.send(TAG, 'Speed', {speed: speed});

        if (this.positon.equals(position) === false) {
            this.positon = position;

            /**
             * Position changed event.
             * @event drivers.motion.MotionDriver#positionChanged
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
        if (state !== this.state) {
            this.state = state;

            /**
             * State change event.
             * @event drivers.motion.MotionDriver#stateChanged
             * @property {Number} state - New state
             */
            this.emit('stateChanged', this.name, this.state);
        }

        if (orientation !== this.orientation) {
            this.orientation = orientation;

            /**
             * Orientation change event.
             * @event drivers.motion.MotionDriver#orientationChanged
             * @property {String} driverName - Unique name of a driver
             * @property {Number} orientation - New orientation
             */
            this.emit('orientationChanged',
                this.name,
                orientation,
                this.config.precision
            );
        }
    }

    _onAReceived(buffer) {
        delete this._waitACKQueue[buffer.readUInt8()];
    }

    /**
     * Callback will be called when new packet is arrived and it will dispatch event to new
     * callback depending on packet type
     * @param buffer {Buffer} - Payload
     * @param type {String} - Packet type
     * @private
     */
    _onDataReceived(buffer, type) {
        if (type === ('P'.charCodeAt(0)) && buffer.length === 9) {
            this._onPReceived(buffer);
        }
        else if (type == 'A'.charCodeAt(0) && buffer.length === 1) {
            this._onAReceived(buffer);
        }
    }

    /**
     * Get position of the robot
     * @return {Point} - Position of the robot
     */
    getPosition() {
        return this.positon;
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

    getActiveSpeed() {
        return this._activeSpeed;
    }
}

module.exports = MotionDriver;