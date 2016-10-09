const driverManager = Mep.getDriverManager();
const MotionDriverConstants = Mep.require('drivers/motion/Constants');
const PositionEstimator = require('./PositionEstimator');

const TAG = 'PositionService';

/**
 * Provides a very abstract way to control and estimate robot position
 * @class
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class PositionService {
    constructor(config) {
        var that = this;

        this.config = config;
        this.currentSpeed = 100;
        this.positionEstimator = new PositionEstimator();
        this.modbusDriver = driverManager.getDriver('ModbusDriver');
        this.motionDriver = null;
        this.motionDriverAvailable = true;


        // Check if driver is active
        if (driverManager.isDriverAvailable('MotionDriver') === true) {
            this.motionDriver = driverManager.getDriver('MotionDriver');
        } else {
            this.motionDriverAvailable = false;
            Mep.Log.warn(TAG, 'No motion driver available');
        }

        // Subscribe to stop
        for (let iSlaveAddress = 1; iSlaveAddress <= 1; iSlaveAddress++) {
            for (let iFunctionAddress = 0; iFunctionAddress <= 9; iFunctionAddress++) {
                this.modbusDriver.registerCoilReading(iSlaveAddress, iFunctionAddress);
            }
        }

        this.modbusDriver.on('coilChanged', function (slaveAddress, functionAddress, state, id) {
            if (that.motionDriverAvailable === true) {
                that.motionDriver.stop();
            }
        });
    }

    /**
     * Move the robot, set new position of the robot
     *
     * @param {TunedPoint} tunedPoint - Point that should be reached
     * @param {Boolean} pathfinding - Use path finding algorithm
     * @param {String} direction - Direction of robot movement
     * @param {Boolean} relative - Use relative to previous position
     * @param {Number} tolerance - Position will consider as reached if Euclid's distance between current
     * and required position is less than tolerance
     * @param {Number} speed - Speed of the robot movement in range (0, 255)
     * @returns {Promise}
     */
    set(tunedPoint, {
        pathfinding = this.config.moveOptions.pathfinding,
        direction = this.config.moveOptions.direction,
        relative = this.config.moveOptions.relative,
        tolerance = this.config.moveOptions.tolerance,
        speed = this.config.moveOptions.speed
    } = {}) {

        // Set speed
        if (this.currentSpeed !== speed) {
            this.currentSpeed = speed;
            this.motionDriver.setSpeed(speed);
        }

        // Move the robot
        var point = tunedPoint.getPoint();
        this.motionDriver.moveToPosition(
            point.getX(),
            point.getY(),
            (direction === 'backward') ?
                MotionDriverConstants.DIRECTION_BACKWARD :
                MotionDriverConstants.DIRECTION_FORWARD
        );

        Mep.Log.debug(TAG, 'Robot move command sent.', tunedPoint.getPoint());

        // Check when robot reached the position
        return new Promise((resolve, reject) => {
            this.positionEstimator.on('positionChanged', (position) => {
                if (point.getDistance(position) <= tolerance) {
                    resolve();
                }
            });
        });
    }

    rotate(tunedAngle, options) {

    }
}

module.exports = PositionService;
