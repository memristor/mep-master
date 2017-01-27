const PositionEstimator = require('./PositionEstimator');
const TaskError = Mep.require('types/TaskError');
const EventEmitter = require('events').EventEmitter;
const Point = Mep.require('types/Point');
const MotionDriver = Mep.require('drivers/motion/MotionDriver');

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
        this.motionDriver = Mep.DriverManager.getDriver('MotionDriver');

        this.required = {
            points: [],
            params: {}
        };
        this.pathObstacleSources = [[], []];

        // Subscribe on sensors that can provide obstacles on the robot's terrain
        Mep.DriverManager.callMethodByGroup('terrain', 'on', ['pathObstacleDetected', this._onPathObstacleDetected.bind(this)]);
    }

    /**
     * Get current robot's position
     * @returns {Point} Current position
     */
    getPosition() {
        return this.positionEstimator.getPosition();
    }

    /**
     * Get current robot's orientation
     * @returns {Number} Orientation in degrees
     */
    getOrientation() {
        return this.positionEstimator.getOrientation();
    }

    _onPathObstacleDetected(source, relativePOI, detected, front) {
        // Add source or remove source
        // `pathObstacleSources[0]` is array of obstacle source detected on a back of robot
        // `pathObstacleSources[1]` is array of obstacle source detected on a front of robot
        if (detected === true) {
            if (this.pathObstacleSources[+front].indexOf(source) < 0) {
                this.pathObstacleSources[+front].push(source);
            }
        } else {
            // Delete the source which previously detected a path obstacle
            this.pathObstacleSources[+front].splice(this.pathObstacleSources[+front].indexOf(source), 1);
        }

        // If something is detected
        if (detected === true) {

            // Fire the event if only one sensor detected a path obstacle
            // Required behaviour is single event if obstacle is detected (not multiple events from multiple sensors)
            if (this.pathObstacleSources[this.motionDriver.getDirection()].length > 0) {
                // Check if the obstacle is on the path
                if ((front === true && this.motionDriver.getDirection() === MotionDriver.DIRECTION_FORWARD) ||
                    (front === false && this.motionDriver.getDirection() === MotionDriver.DIRECTION_BACKWARD)) {
                    // Check if it is outside of terrain
                    let poi = relativePOI.clone();
                    poi.rotate(new Point(0, 0), this.getOrientation());
                    poi.translate(this.getPosition());

                    if (poi.getX() < 1500 && poi.getX() > -1500 &&
                        poi.getY() < 1000 && poi.getY() > -1000) {
                        // TODO: Check if it is not a static obstacle

                        this.emit('pathObstacleDetected', true);
                    }
                }
            }
        } else {
            if (this.pathObstacleSources[this.motionDriver.getDirection()].length === 0) {
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
            params: {},
            points: []
        };
        Object.assign(this.required.params, this.config.moveOptions, params);


        // Apply relative
        if (this.required.params.relative === true) {
            destinationPoint.setX(destinationPoint.getX() + this.getPosition().getX());
            destinationPoint.setY(destinationPoint.getY() + this.getPosition().getY());
        }

        // Apply terrain finding
        if (this.required.params.pathfinding === true) {
            let currentPoint = this.getPosition();
            this.required.points = Mep.getTerrainService().findPath(currentPoint, destinationPoint);

            Mep.Log.debug(TAG, 'Start path finding from', currentPoint, 'to', this.required.points);
        } else {
            this.required.points = [destinationPoint];
        }

        return new Promise((resolve, reject) => {
            if (positionService.required.points.length === 0) {
                reject(new TaskError(TAG, 'FindPath', 'Cannot go to required position, no path found'));
            }

            this._goToNextQueuedPoint(resolve, reject);
        });
    }

    _goToNextQueuedPoint(resolve, reject) {
        let positionService = this;
        let point;
        if (this.required.points.length > 0) {
            point = this.required.points[0];
            this.required.points.splice(0, 1);
            this._basicSet(
                point,
                this.required.params.direction,
                this.required.params.tolerance,
                this.required.params.speed
            ).then(() => {
                this._goToNextQueuedPoint.bind(positionService);
                this._goToNextQueuedPoint(resolve, reject);
            });
            return;
        } else {
            resolve();
        }
    }

    _promiseToReachDestination(point, tolerance) {
        let motionDriver = this.motionDriver;
        let res = null;
        let ss = (name, currentPosition) => {
            if (currentPosition.getDistance(point) <= tolerance) {
                motionDriver.finishCommand();
                res();
                motionDriver.removeListener('positionChanged', ss);
            }
        };

        return new Promise((resolve, reject) => {
            res = resolve;
            // If tolerance is set to use Euclid's distance to determine if robot can execute next command
            // It is useful if you want to continue
            if (tolerance >= 0) {
                motionDriver.on('positionChanged', ss);
            }

            // In every case wait new state of motion driver
            this.motionDriver.on('stateChanged', (state) => {
                if (state === MotionDriver.STATE_IDLE) {
                    resolve();
                } else if (state === MotionDriver.STATE_STUCK) {
                    reject(new TaskError(TAG, 'stuck', 'Robot is stacked'));
                } else if (state === MotionDriver.STATE_ERROR) {
                    reject(new TaskError(TAG, 'error', 'Unknown moving error'));
                }
            });
        });
    }

    _basicSet(point, direction, tolerance, speed) {
        Mep.Log.debug(TAG, 'Basic set',  point);

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
        return this._promiseToReachDestination(point, tolerance);
    }

    /**
     * Make a curve
     * @param point {Number} - Center of circle
     * @param angle {Number} - Angle
     * @param direction {Number} - Direction
     * @returns {Promise}
     */
    arc(point, angle, direction) {
        this.motionDriver.moveArc(point.getX(), point.getY(), angle, direction);
        return this._promiseToReachDestination();
    }

    stop(softStop = false) {
        if (softStop === true) {
            this.motionDriver.softStop();
        } else {
            this.motionDriver.stop();
        }
    }

    continue() {

    }

    /**
     * Rotate robot for an angle
     * @param tunedAngle {TunedAngle} - Angle to rotate
     * @param options {Object} - Additional options
     */
    rotate(tunedAngle, options) {
        this.motionDriver.rotateTo(tunedAngle.getAngle());
    }
}

module.exports = PositionService;
