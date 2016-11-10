const MotionDriverBinder = require('bindings')('motion').MotionDriverBinder;
const EventEmiter = require('events');
const Util = require('util');
const Point = Mep.require('types/Point');

Util.inherits(MotionDriverBinder, EventEmiter);

/**
 * Driver enables communication with Memristor's motion driver.
 *
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 * @fires MotionDriver#positionChanged
 */
class MotionDriver extends MotionDriverBinder {
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
            config.startY
        );
        this.name = name;
        this.config = config;
        this.lastPositon = new Point(0, 0);

        this.refreshDataLoop.bind(this);
    }

    refreshDataLoop() {
        let that = this;

        this.refreshData(() => {
            let position = that.getPosition();

            // If position is changed fire an event
            if (position.equals(that.lastPositon) === false) {
                /**
                 * Position changed event.
                 * @event MotionDriver#positionChanged
                 * @property {String} driverName - Unique name of a driver
                 * @property {Point} point - Position of the robot
                 */
                that.emit('positionChanged',
                    that.name,
                    that.getPosition(),
                    that.config.precision
                );

                that.lastPositon.clone(position);
            }
        });

        setTimeout(this.refreshDataLoop, this.config.refreshDataPeriod);
    }

    /**
     * Get position of the robot
     * @return {Point} - Position of the robot
     */
    getPosition() {
        let position = super.getPosition();
        return (new Point(position[0], position[1]));
    }

    provides() {
        return ['position', 'control'];
    }
}

module.exports = MotionDriver;
