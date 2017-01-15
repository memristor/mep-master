const driverManager = Mep.getDriverManager();
const PositionEstimator = require('./PositionEstimator');
const MotionDriver = Mep.require('drivers/motion/MotionDriver');
const TaskError = Mep.require('types/TaskError');
const EventEmitter = require('events').EventEmitter;

const TAG = 'PositionService';

/**
 * Provides a very abstract way to control and estimate robot position
 * @fires PositionService#pathObstacleDetected
 *
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class PositionService extends EventEmitter {
    init(config) {
        this.config = config;
        this.currentSpeed = 0;
        this.positionEstimator = new PositionEstimator();
        this.motionDriver = null;

        this.required = {
            points: [],
            params: {}
        };
        this.detectedPathObstaclesSources = [];

        // Check if driver is active
        if (driverManager.isDriverAvailable('MotionDriver') === true) {
            this.motionDriver = driverManager.getDriver('MotionDriver');
        } else {
            Mep.Log.warn(TAG, 'No motion driver available');
        }

        // Subscribe on sensors that can provide obstacles on the robot's terrain
        driverManager.callMethodByGroup('terrain', 'on', ['pathObstacleDetected', this._onPathObstacleDetected.bind(this)]);
    }

    getPosition() {
        return this.positionEstimator.getPosition();
    }

    getOrientation() {
        return this.positionEstimator.getOrientation();
    }

    _onPathObstacleDetected(source, poi, state, front) {
        // If something is detected
        if (state === true) {
            // If in front of robot
            if ((front === true && this.motionDriver.getDirection() === MotionDriver.DIRECTION_FORWARD) ||
                (front === false && this.motionDriver.getDirection() === MotionDriver.DIRECTION_BACKWARD)) {

                // TODO: Check if it is not a static obstacle

                // Fire the event if only one sensor detected a path obstacle
                // Required behaviour is single event if obstacle is detected (not multiple events from multiple sensors)
                if (this.detectedPathObstaclesSources.length === 0) {
                    this.emit('pathObstacleDetected', true);
                }

                // Add source
                if (this.detectedPathObstaclesSources.indexOf(source) < 0) {
                    this.detectedPathObstaclesSources.push(source);
                }
            }
        } else {
            // Delete the source which previously detected a path obstacle
            this.detectedPathObstaclesSources.splice(this.detectedPathObstaclesSources.indexOf(source), 1);

            if (this.detectedPathObstaclesSources.length === 0) {
                this.emit('pathObstacleDetected', false);
            }
        }
    }

    /**
     * Move the robot, set new position of the robot
     *
     * @param {TunedPoint} tunedPoint - Point that should be reached
     * @param {Boolean} params.pathfinding - Use terrain finding algorithm
     * @param {String} params.direction - Direction of robot movement
     * @param {Boolean} params.relative - Use relative to previous position
     * @param {Number} params.tolerance - Position will consider as reached if Euclid's distance between current
     * and required position is less than tolerance
     * @param {Number} params.speed - Speed of the robot movement in range (0, 255)
     * @returns {Promise}
     */
    set(tunedPoint, params) {
        let positionService = this;
        let destinationPoint = tunedPoint.getPoint();

        this.required = {
            params: Object.assign(this.config.moveOptions, params),
            points: []
        };

        // Apply relative
        if (this.required.params.relative === true) {
            destinationPoint.setX(destinationPoint.getX() + this.getPosition().getX());
            destinationPoint.setY(destinationPoint.getY() + this.getPosition().getY());
        }

        // Apply terrain finding
        if (this.required.params.pathfinding === true) {
            let currentPoint = this.getPosition();
            Mep.Telemetry.send(TAG, 'set', {state: state, front: front});
            Mep.Log.debug(TAG, 'Start terrain finding from position', currentPoint);

            this.required.points = Mep.getTerrainService().findPath(currentPoint, destinationPoint);
            Mep.Log.debug(TAG, 'Start terrain finding', points, 'from point', currentPoint);
        } else {
            this.required.points = [destinationPoint];
        }

        return new Promise((resolve, reject) => {
            if (positionService.required.points.length === 0) {
                reject(new TaskError(TAG, 'FindPath', 'Cannot go to required position, no path found'));
            }

            function goToNext() {
                let point;
                if (positionService.required.points.length > 0) {
                    point = positionService.required.points[0];
                    positionService.required.points.splice(0, 1);
                    positionService._basicSet(
                        point,
                        positionService.required.params.direction,
                        positionService.required.params.tolerance,
                        positionService.required.params.speed
                    ).then(goToNext);
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
                if (state === MotionDriver.STATE_IDLE) {
                    resolve();
                } else if (state === MotionDriver.STATE_STUCK) {
                    reject(new TaskError(TAG, 'stuck', 'Robot is stucked'));
                } else if (state === MotionDriver.STATE_ERROR) {
                    reject(new TaskError(TAG, 'error', 'Unknown moving error'));
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
                MotionDriver.DIRECTION_BACKWARD :
                MotionDriver.DIRECTION_FORWARD
        );

        // Check when robot reached the position
        return this._promiseToReachDestionation();
    }

    arc(point, angle, direction) {
        this.motionDriver.moveArc(point.getX(), point.getY(), angle, direction);

        return this._promiseToReachDestionation();
    }

    rotate(tunedAngle, options) {
        this.motionDriver.rotateTo(tunedAngle.getAngle());
    }
}

module.exports = PositionService;
