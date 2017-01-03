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
        this.currentSpeed = 0;
        this.positionEstimator = new PositionEstimator();
        this.motionDriver = null;

        // Prepare methods
        this.startAvoidingStrategy.bind(this);
        this.onPathObstacleDetected.bind(this);

        // Check if driver is active
        if (driverManager.isDriverAvailable('MotionDriver') === true) {
            this.motionDriver = driverManager.getDriver('MotionDriver');
        } else {
            Mep.Log.warn(TAG, 'No motion driver available');
        }

        // Subscribe on sensors that can provide obstacles on the robot's terrain
        this.drivers = driverManager.getDriversByGroup('terrain');
        for (let driverName in this.drivers) {
            this.drivers[driverName].on('pathObstacleDetected', this.onPathObstacleDetected);
        }
    }

    onPathObstacleDetected(state, front) {
        // If something is detected
        if (state === true) {

            // If in front of robot
            if ((front === true && this.motionDriver.getDirection() === MotionDriverConstants.DIRECTION_FORWARD) ||
                (front === false && this.motionDriver.getDirection() === MotionDriverConstants.DIRECTION_BACKWARD)) {

                // TODO: Check if it is not a static obstacle
                this.startAvoidingStrategy();
            }
        }
    }

    startAvoidingStrategy() {
        this.motionDriver.stop();
    }

    /**
     * Move the robot, set new position of the robot
     *
     * @param {TunedPoint} tunedPoint - Point that should be reached
     * @param {Boolean} pathfinding - Use terrain finding algorithm
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
        speed = undefined
    } = {}) {
        let positionService = this;
        let destinationPoint = tunedPoint.getPoint();
        let points = [];

        // Apply relative
        if (relative === true) {
            destinationPoint.setX(destinationPoint.getX() + this.positionEstimator.getPosition().getX());
            destinationPoint.setY(destinationPoint.getY() + this.positionEstimator.getPosition().getY());
        }

        // Apply terrain finding
        if (pathfinding === true) {

            let currentPoint = this.positionEstimator.getPosition();
            Mep.Telemetry.send(TAG, 'set', {state: state, front: front});
            Mep.Log.debug(TAG, 'Start terrain finding from position', currentPoint);

            points = Mep.getTerrainService().findPath(currentPoint, destinationPoint);
            Mep.Log.debug(TAG, 'Start terrain finding', points, 'from point', currentPoint);
        } else {
            points = [destinationPoint];
        }

        return new Promise((resolve, reject) => {
            // TODO: Call reject() if there is no terrain found by pathfidning

            function goToNext() {
                let point;
                if (points.length > 0) {
                    point = points[0];
                    points.splice(0, 1);
                    positionService._basicSet(point, direction, tolerance, speed).then(goToNext);
                    return;
                } else {
                    resolve();
                }
            }

            goToNext();
        });
    }

    _promiseToReachDestionation() {
        return new Promise((resolve, reject) => {
            this.motionDriver.on('stateChanged', (state) => {
                if (state === MotionDriverConstants.STATE_IDLE) {
                    resolve();
                }
                else if (state === MotionDriverConstants.STATE_ERROR ||
                    state === MotionDriverConstants.STATE_STUCK) {
                    reject(state);
                }
            });
        });
    }

    _basicSet(point, direction, tolerance, speed) {
        // Set speed
        if (speed !== undefined && this.currentSpeed !== speed) {
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

        // Check when robot reached the position
        return this._promiseToReachDestionation();
    }

    arc(point, angle, direction) {
        this.motionDriver.moveArc(point.getX(), point.getY(), angle, direction);

        return this._promiseToReachDestionation();
    }

    rotate(tunedAngle, options) {
        // TODO
    }
}

module.exports = PositionService;
