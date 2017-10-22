'use strict';
/** @namespace drivers.motion */

const MotionDriverBinder = require('bindings')('motion').MotionDriverBinder;
const Point = Mep.require("misc/geometry/Point");
const Util = require('util');
const EventEmitter = require('events');

Util.inherits(MotionDriverBinder, EventEmitter);


/**
 * Natively (C++) implemented driver that enables communication with Memristor's motion driver.
 *
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 * @fires MotionDriverNative#positionChanged
 * @memberOf drivers.motion
 */
class MotionDriverNative extends MotionDriverBinder  {
    static get DIRECTION_FORWARD() { return 1; }
    static get DIRECTION_BACKWARD() { return -1; }
    static get STATE_IDLE() { return 1; }
    static get STATE_STUCK() { return 2; }
    static get STATE_MOVING() { return 3; }
    static get STATE_ROTATING() { return 4; }
    static get STATE_ERROR() { return 5; }

    /**
     * Read data from motion driver (as the electronic component)
     * @method refreshData
     * @memberof drivers.motion.MotionDriverNative#
     * @param callback {Function} - Callback function will be called after data is refreshed
     */

    /**
     * Stop the robot.
     * @method stop
     * @memberof drivers.motion.MotionDriverNative#
     */

    /**
     * Stop robot by turning off motors.
     * @method softStop
     * @memberof drivers.motion.MotionDriverNative#
     */

    /**
     * Move robot straight
     * @method moveStraight
     * @memberof drivers.motion.MotionDriverNative#
     * @param distance {Number} - Distance in mm
     */

    /**
     * Set default speed of the robot
     * @method setSpeed
     * @memberof drivers.motion.MotionDriverNative#
     * @param speed {Number} - Speed (0 - 255)
     */

    /**
     * Move robot to the absolute position
     * @method moveToPosition
     * @memberof drivers.motion.MotionDriverNative#
     * @param positionX {Number} - X coordinate relative to start position of the robot
     * @param positionY {Number} - Y coordinate relative to start position of the robot
     * @param direction {Number} - Direction, can be Constants.DIRECTION_FORWARD or Constants.DIRECTION_BACKWARD
     */

    /**
     * @param name {String} - Unique driver name
     * @param config {Object} - Configuration presented as an associative array
     */
    constructor(name, config) {
        super(
            true,
            config.startX,
            config.startY,
            config.startOrientation,
            config.startSpeed
        );

        this.name = name;
        this.config = config;

        this.positon = new Point(config.startX, config.startY);
        this.direction = MotionDriver.DIRECTION_FORWARD;
        this.state = MotionDriver.STATE_IDLE;
        this.orientation = config.startOrientation;

        this.refreshDataLoop.bind(this);
        this.refreshDataLoop();
    }

    refreshDataLoop() {
        let motionDriver = this;

        this.refreshData(() => {
            let data = motionDriver.getData();

            // If position is changed fire an event
            if (data.position.x !== motionDriver.positon.getX() ||
                data.position.y !== motionDriver.positon.getY()) {

                motionDriver.positon.setX(data.position.x);
                motionDriver.positon.setY(data.position.y);

                /**
                 * Position changed event.
                 * @event drivers.motion.MotionDriverNative#positionChanged
                 * @property {String} driverName - Unique name of a driver
                 * @property {Point} point - Position of the robot
                 */
                motionDriver.emit('positionChanged',
                    motionDriver.name,
                    motionDriver.positon,
                    motionDriver.config.precision
                );
            }

            // If state is changed
            if (data.state !== motionDriver.state) {
                motionDriver.state = data.state;

                /**
                 * State change event.
                 * @event drivers.motion.MotionDriverNative#stateChanged
                 * @property {Number} state - New state
                 */
                motionDriver.emit('stateChanged', motionDriver.getState());
            }

            if (data.orientation !== motionDriver.orientation) {
                motionDriver.orientation = data.orientation;

                /**
                 * Orientation change event.
                 * @event drivers.motion.MotionDriverNative#orientationChanged
                 * @property {String} driverName - Unique name of a driver
                 * @property {Number} orientation - New orientation
                 */
                motionDriver.emit('orientationChanged',
                    motionDriver.name,
                    motionDriver.getOrientation(),
                    motionDriver.config.precision
                );
            }

            // If direction changed
            if (data.direction !== motionDriver.direction) {
                motionDriver.direction = data.direction;
            }
        });

        // Call refreshDataLoop() again with a delay
        setTimeout(this.refreshDataLoop.bind(this), this.config.refreshDataPeriod);
    }

    /**
     * Get position of the robot
     * @return {Point} - Position of the robot
     */
    getPosition() {
        return this.position;
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

module.exports = MotionDriverNative;
