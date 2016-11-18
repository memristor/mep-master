const driverManager = Mep.getDriverManager();
const MotionDriverConstants = Mep.require('drivers/motion/Constants');
const PositionEstimator = require('./PositionEstimator');

const TAG = 'PositionService';

/**
 * Provides a very abstract way to control and estimate robot position
 *
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class PositionService {
    constructor(config) {
        this.config = config;
        this.currentSpeed = 100;
        this.positionEstimator = new PositionEstimator();
        this.motionDriver = null;

        // Prepare methods
        this.startAvoidingStrategy.bind(this);

        // Check if driver is active
        if (driverManager.isDriverAvailable('MotionDriver') === true) {
            this.motionDriver = driverManager.getDriver('MotionDriver');
        } else {
            Mep.Log.warn(TAG, 'No motion driver available');
        }

        // Subscribe on sensors that can provide obstacles on the robot's path
        this.drivers = driverManager.getDataProviderDrivers('terrain');
        for (var driverName in this.drivers) {
            this.drivers[driverName].on('pathObstacleDetected', this.startAvoidingStrategy);
        }
    }

    startAvoidingStrategy(state) {
        if (state === true) {
            this.motionDriver.stop();
        }
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
        let object = this;
        let destinationPoint = tunedPoint.getPoint();
        let points = [];

        // Apply relative
        if (relative === true) {
            destinationPoint.setX(destinationPoint.getX() + this.positionEstimator.getPosition().getX());
            destinationPoint.setY(destinationPoint.getY() + this.positionEstimator.getPosition().getY());
        }

        // Apply path finding
        if (pathfinding === true) {
            let currentPoint = this.positionEstimator.getPosition();

            points = Mep.getPathService().search(currentPoint, destinationPoint);
            Mep.Log.debug(TAG, 'Start path finding', points, 'from point', currentPoint);
        } else {
            points = [destinationPoint];
        }

        return new Promise((resolve, reject) => {
            function goToNext() {
                let point;
                if (points.length > 0) {
                    point = points[0];
                    points.splice(0, 1);
                    object._basicSet(point, direction, tolerance, speed).then(goToNext);
                    return;
                }
                resolve();
            }

            goToNext();
        });
    }

    _basicSet(point, direction, tolerance, speed) {
        // Set speed
        if (this.currentSpeed !== speed) {
            this.currentSpeed = speed;
            this.motionDriver.setSpeed(speed);
        }

        // Move the robot
        this.motionDriver.moveToPosition(
            point.getX(),
            point.getY(),
            (direction === 'backward') ?
                MotionDriverConstants.DIRECTION_BACKWARD :
                MotionDriverConstants.DIRECTION_FORWARD
        );

        Mep.Log.debug(TAG, 'Robot move command sent.', point);

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
        // TODO
    }
}

module.exports = PositionService;
