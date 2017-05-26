'use strict';
/** @namespace drivers.motion */

const Point = Mep.require('misc/Point');
const EventEmitter = require('events');
const Buffer = require('buffer').Buffer;
const TaskError = Mep.require('strategy/TaskError');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const Delay = Mep.require('misc/Delay');

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

    static get DIRECTION_FORWARD() { return 1; }
    static get DIRECTION_UNDEFINED() { return 0; }
    static get DIRECTION_BACKWARD() { return -1; }

    static get CONFIG_DISTANCE_REGULATOR() { return 0; }
    static get CONFIG_ROTATION_REGULATOR() { return 1; }
    static get CONFIG_ENABLE_STUCK() { return 2; }
    static get CONFIG_STUCK() { return 3; }
    static get CONFIG_DEBUG() { return 4; }
    static get CONFIG_STATUS_CHANGE_REPORT() { return 5; }
    static get CONFIG_KEEP_COUNT() { return 6; }
    static get CONFIG_TMR() { return 7; }

    static get CONFIG_STUCK_DISTANCE_JUMP() { return 8; }
    static get CONFIG_STUCK_ROTATION_JUMP() { return 9; }
    static get CONFIG_STUCK_DISTANCE_MAX_FAIL_COUNT() { return 10; }
    static get CONFIG_STUCK_ROTATION_MAX_FAIL_COUNT() { return 11; }
    static get CONFIG_MOTOR_SPEED_LIMIT() { return 12; }
    static get CONFIG_MOTOR_RATE_OF_CHANGE() { return 13; }
    static get CONFIG_SEND_STATUS_INTERVAL() { return 15; }

    static get CONFIG_WHEEL_DISTANCE() { return 15; }
    static get CONFIG_WHEEL_R1() { return 16; }
    static get CONFIG_WHEEL_R2() { return 17; }
    static get CONFIG_PID_D_P() { return 18; }
    static get CONFIG_PID_D_D() { return 19; }
    static get CONFIG_PID_R_P() { return 20; }
    static get CONFIG_PID_R_D() { return 21; }
    static get CONFIG_VMAX() { return 22; }
    static get CONFIG_OMEGA() { return 23; }
    static get CONFIG_ACCEL() { return 24; }
    static get CONFIG_ALPHA() { return 25; }
    static get CONFIG_SLOWDOWN() { return 26; }
    static get CONFIG_ANGLE_SPEEDUP() { return 27; }



    /**
     * @param {String} name Unique driver name
     * @param {Object} config Configuration presented as an associative array
     * @param {strategy.TunedPoint} [config.startPosition] X coordinate for start position
     * @param {strategy.TunedAngle} [config.startOrientation] Start orientation
     * @param {Number} [config.startSpeed] Initial speed
     * @param {Number} [config.refreshDataPeriod] Get state from motion driver every `refreshDataPeriod` in ms
     * @param {Number} [config.connectionTimeout] Connection timeout in ms
     * @param {Number} [config.ackTimeout] Acknowledgment timeout
     */
    constructor(name, config) {
        super();

        this.name = name;
        this.config = Object.assign({
            startOrientation: 0,
            startSpeed: 100,
            refreshDataPeriod: 100,
            connectionTimeout: 4000,
            ackTimeout: 150,
            commandTimeout: (10 * 1000),
            commandStartTimeout: (2 * 1000)
        }, config);

        this.positon = new TunedPoint(...this.config.startPosition).getPoint();
        this.orientation = new TunedAngle(...config.startOrientation).getAngle();
        this._activeSpeed = config.startSpeed;
        this._breaking = false;
        this._direction = MotionDriver.DIRECTION_UNDEFINED;

        this.communicator = Mep.DriverManager.getDriver(config['@dependencies'].communicator);


        this._waitACKQueue = {};

        if(this.config.cid === undefined) {
			this.communicator.on('data', this._onDataReceived.bind(this));
		} else {
			this.communicator.on('data_' + this.config.cid, this._onDataReceivedCAN.bind(this));
		}
    }

    _waitACK(type) {
        let motionDriver = this;

        setTimeout(() => {
            if (this._waitACKQueue[type] !== undefined) {
                Mep.Log.error(TAG, 'Error sending a command', type);
                motionDriver._sendCommand(this._waitACKQueue[type]);
            }
        }, this.config.ackTimeout);
    }

    _sendCommand(buff) {
		if(this.config.cid === undefined) {
			// using UART
			let type = buff.readUInt8(0);
			this._waitACKQueue[type] = buff;
			this._waitACK(type);
			this.communicator.send(buff);
		} else {
			// using CAN
			this.communicator.send(this.config.cid, buff);
		}
    }

    getDirection() {
        return this._direction;
    }

    /**
     * Check driver by checking checking communication with motion driver board
     */
    async init() {
        let motionDriver = this;

        this.reset();
        this.setPositionAndOrientation(
            this.positon.getX(),
            this.positon.getY(),
            this.orientation
        );
        this.setConfig(MotionDriver.CONFIG_SEND_STATUS_INTERVAL, this.config.refreshDataPeriod, 0);
        this.setConfig(28, 2.85, 2);
        this.setConfig(29, 1.2, 1);
        this.setConfig(30, 0.2, 1);
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

    setConfig(key, value, exp = 3) {
        let fixedValue = (value * Math.pow(10, exp)) | 0;

        let buffer = Buffer.from([
            'c'.charCodeAt(0),
            key & 0xFF,
            (fixedValue >> 20) & 0x0F,
            (fixedValue >> 12) & 0xFF,
            (fixedValue >> 4) & 0xFF,
            ((fixedValue & 0x0F) << 4) | (exp & 0x0F)
        ]);

        this._sendCommand(buffer);
    }

    getConfig(key) {
        let buffer = Buffer.from([
            'C'.charCodeAt(0),
            key & 0xFF
        ]);
        this._sendCommand(buffer);
    }

    _onCReceived(buffer) {
        let value = buffer.readUInt8(0) << 20;
        value |= buffer.readUInt8(1) << 12;
        value |= buffer.readUInt8(2) << 4;
        value |= buffer.readUInt8(3) >> 4;

        let exp = buffer.readUInt8(3) & 0x0F;

        let result = value / Math.pow(10, exp);

        Mep.Log.info(TAG, 'Value =', result)
    }

    /**
     * Rotate robot to given angle
     * @param {Number} angle Angle
     * @returns {Promise}
     */
    rotateTo(angle) {
        this._direction = MotionDriver.DIRECTION_UNDEFINED;
        this._sendCommand(Buffer.from([
            'A'.charCodeAt(0),
            angle >> 8,
            angle & 0xFF
        ]));
        this._breaking = false;

        return this._promiseToStateChanged();
    }

    /**
     * Rotate for given angle
     * @param {Number} angle
     * @returns {Promise}
     */
    rotateFor(angle) {
        this._direction = MotionDriver.DIRECTION_UNDEFINED;
        this._sendCommand(Buffer.from([
            'T'.charCodeAt(0),
            angle >> 8,
            angle & 0xFF
        ]));
        this._breaking = false;

        return this._promiseToStateChanged();
    }

    _promiseToStateChanged() {
        let motionDriver = this;

        let timeout = setTimeout(() => {
            motionDriver.emit('stateChanged', MotionDriver.STATE_STUCK);
        }, this.config.commandTimeout);

        let startTimeout = setTimeout(() => {
            motionDriver.emit('stateChanged', MotionDriver.STATE_STUCK);
        }, this.config.commandStartTimeout);

        return new Promise((resolve, reject) => {
            let stateListener = (name, state) => {
                switch (state) {
                    case MotionDriver.STATE_IDLE:
                        Mep.Log.debug(TAG, 'Resolved');
                        clearTimeout(timeout);
                        clearTimeout(startTimeout);
                        resolve();
                        motionDriver.removeListener('stateChanged', stateListener);
                        break;
                    case MotionDriver.STATE_STUCK:
                        clearTimeout(timeout);
                        clearTimeout(startTimeout);
                        reject(new TaskError(TAG, 'stuck', 'Robot is stacked'));
                        motionDriver.removeListener('stateChanged', stateListener);
                        break;
                    case MotionDriver.STATE_ERROR:
                        clearTimeout(timeout);
                        clearTimeout(startTimeout);
                        reject(new TaskError(TAG, 'error', 'Unknown moving error'));
                        motionDriver.removeListener('stateChanged', stateListener);
                        break;
                    case MotionDriver.STATE_BREAK:
                        clearTimeout(timeout);
                        clearTimeout(startTimeout);
                        reject(new TaskError(TAG, 'break', 'Command is broken by another one'));
                        motionDriver.removeListener('stateChanged', stateListener);
                        break;
                    default:
                        clearTimeout(startTimeout);
                        break;
                }
            };

            this.on('stateChanged', stateListener);
        });
    }

    /**
     * Move robot forward or backward depending on sign
     * @param {Number} millimeters
     * @deprecated
     */
    goForward(millimeters) {
        this._direction = (millimeters > 0) ?
            MotionDriver.DIRECTION_FORWARD : MotionDriver.DIRECTION_BACKWARD;
        this._sendCommand(Buffer.from([
            'D'.charCodeAt(0),
            millimeters >> 8,
            millimeters & 0xFF,
            0
        ]));
        return this._promiseToStateChanged();
    }

    /**
     * Stop the robot.
     */
    stop() {
        this._direction = MotionDriver.DIRECTION_UNDEFINED;
        this._breaking = true;
        this.state = MotionDriver.STATE_IDLE;
        this.emit('stateChanged', this.name, MotionDriver.STATE_BREAK);
        this._sendCommand(Buffer.from(['S'.charCodeAt(0)]));

        return new Promise((resolve, reject) => {
            setTimeout(resolve, 700);
        });
    }

    /**
     * Stop robot by turning off motors.
     */
    softStop() {
        this._direction = MotionDriver.DIRECTION_UNDEFINED;
        this._breaking = true;
        this.emit('stateChanged', this.name, MotionDriver.STATE_BREAK);
        this._sendCommand(Buffer.from(['s'.charCodeAt(0)]));

        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    /**
     * Set default speed of the robot
     * @param {Number} speed Speed (0 - 255)
     */
    setSpeed(speed) {
        this._activeSpeed = speed | 0;
        this._sendCommand(Buffer.from([
            'V'.charCodeAt(0),
            this._activeSpeed | 0
        ]));
    }

    /**
     * Move robot to absolute position
     * @param {misc.Point} position Required position of the robot
     * @param {Number} direction Direction, can be MotionDriver.DIRECTION_FORWARD or
     * MotionDriver.DIRECTION_BACKWARD
     */
    moveToPosition(position, direction) {
        this._direction = direction;
        this._sendCommand(Buffer.from([
            'G'.charCodeAt(0),
            position.getX() >> 8,
            position.getX() & 0xff,
            position.getY() >> 8,
            position.getY() & 0xff,
            0,
            direction
        ]));

        this._breaking = false;

        return this._promiseToStateChanged();
    }

    /**
     * Move robot to absolute position but robot make curves to speed up motion. This
     * command requires `finishCommand()` before next motion command.
     * @param {misc.Point} position Required position of the robot
     * @param {Number} direction Direction, can be MotionDriver.DIRECTION_FORWARD or
     * MotionDriver.DIRECTION_BACKWARD
     * @param {Number} tolerance Radius
     */
    moveToCurvilinear(position, direction, radius, tolerance) {
        let motionDriver = this;

        this._direction = direction;
        this._sendCommand(Buffer.from([
            'N'.charCodeAt(0),
            position.getX() >> 8,
            position.getX() & 0xff,
            position.getY() >> 8,
            position.getY() & 0xff,
            direction,
            radius >> 8,
            radius & 0xff,
        ]));
        this._breaking = false;

        return new Promise((resolve, reject) => {
            let positionListener = (name, currentPosition) => {
                if (currentPosition.getDistance(position) <= tolerance) {
                    motionDriver.state = MotionDriver.STATE_IDLE;
                    motionDriver.finishCommand();
                    motionDriver.emit('stateChanged', motionDriver.name, motionDriver.state);
                    //motionDriver.removeListener('positionChanged', positionListener);
                    //resolve();
                }
            };
            this.on('positionChanged', positionListener);
            this._promiseToStateChanged()
                .then(() => {
                    motionDriver.removeListener('positionChanged', positionListener);
                    resolve();
                })
                .catch((e) => {
                    motionDriver.removeListener('positionChanged', positionListener);
                    reject(e);
                });
        });
    }

    /**
     * Packet type P is received
     * @param {Buffer} buffer Payload
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
		// let speed = buffer.readInt8(7);

        // Checks
        if ([MotionDriver.STATE_MOVING,
                MotionDriver.STATE_IDLE,
                MotionDriver.STATE_ROTATING,
                MotionDriver.STATE_ERROR,
                MotionDriver.STATE_STUCK].indexOf(state) < 0) {
            return;
        }
        if (orientation < -180 || orientation > 180) return;
        if (position.getX() > 2000 || position.getX() < -2000) return;
        if (position.getY() > 2000 || position.getY() < -2000) return;

        if (this.positon.equals(position) === false) {
            this.positon = position;

            /**
             * Position changed event.
             * @event drivers.motion.MotionDriver#positionChanged
             * @property {String} driverName Unique name of a driver
             * @property {misc.Point} point Position of the robot
             */
            this.emit('positionChanged',
                this.name,
                this.positon,
                this.config.precision
            );
        }

        // If state is changed
        if (state !== this.state) {
            if (this._breaking === false) {
                this.state = state;

                /**
                 * State change event.
                 * @event drivers.motion.MotionDriver#stateChanged
                 * @property {Number} state New state
                 */
                this.emit('stateChanged', this.name, this.state);
                Mep.Log.debug(TAG, 'State', String.fromCharCode(this.state));
            }
        }

        if (orientation !== this.orientation) {
            this.orientation = orientation;

            /**
             * Orientation change event.
             * @event drivers.motion.MotionDriver#orientationChanged
             * @property {String} driverName Unique name of a driver
             * @property {Number} orientation New orientation
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

	_onDataReceivedCAN(buffer) {
		if(buffer.length == 0) return;
		let type = buffer.readUInt8(0);
		let buf = buffer.slice(1);

		if (type == 'P'.charCodeAt(0) && buf.length === 7) {
            this._onPReceived(buf);
        }
        else if (type == 'A'.charCodeAt(0) && buf.length === 0) {
            this._onAReceived(buf);
        }
        else if (type == 'C'.charCodeAt(0) && buf.length === 4) {
            this._onCReceived(buf);
        }
	}
    /**
     * Callback will be called when new packet is arrived and it will dispatch event to new
     * callback depending on packet type
     * @param {Buffer} buffer Payload
     * @param {String} type Packet type
     * @private
     */
    _onDataReceived(buffer, type) {
        if (type == 'P'.charCodeAt(0) && buffer.length === 8) {
            this._onPReceived(buffer);
        }
        else if (type == 'A'.charCodeAt(0) && buffer.length === 1) {
            this._onAReceived(buffer);
        }
        else if (type == 'C'.charCodeAt(0) && buffer.length === 4) {
            this._onCReceived(buffer);
        }
    }

    /**
     * Get position of the robot
     * @return {misc.Point} Position of the robot
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
