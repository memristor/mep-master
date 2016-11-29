const MotionDriverBinder = require('bindings')('motion').MotionDriverBinder;
const Point = Mep.require('types/Point');
const PositionDriver = Mep.require('types/PositionDriver');
const Constants = require('./Constants');
const Util = require('util');
const EventEmitter = require('events');
//const mixin = require('es6-mixin').mixin;

Util.inherits(MotionDriverBinder, EventEmitter);


/**
 * Driver enables communication with Memristor's motion driver.
 *
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 * @fires MotionDriver#positionChanged
 */
class MotionDriver extends MotionDriverBinder  {
    /**
     * Read data from motion driver (as the electronic component)
     * @method refreshData
     * @memberof MotionDriver#
     * @param callback {Function} - Callback function will be called after data is refreshed
     */

    /**
     * Stop the robot.
     * @method stop
     * @memberof MotionDriver#
     */

    /**
     * Move robot straight
     * @method moveStraight
     * @memberof MotionDriver#
     * @param distance {Number} - Distance in mm
     */

    /**
     * Set default speed of the robot
     * @method setSpeed
     * @memberof MotionDriver#
     * @param speed {Number} - Speed (0 - 255)
     */

    /**
     * Move robot to the absolute position
     * @method moveToPosition
     * @memberof MotionDriver#
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
        this.direction = Constants.DIRECTION_FORWARD;
        this.state = Constants.STATE_IDLE;

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
                 * @event MotionDriver#positionChanged
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
                 * @event MotionDriver#stateChanged
                 * @property {Number} state - New state
                 */
                motionDriver.emit('stateChanged', motionDriver.getState());
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
}

module.exports = MotionDriver;
