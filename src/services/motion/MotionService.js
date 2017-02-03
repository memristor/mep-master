'use strict';
/** @namespace services.motion */

const TaskError = Mep.require('strategy/TaskError');
const EventEmitter = require('events').EventEmitter;
const Point = Mep.require('misc/Point');
const MotionDriver = Mep.require('drivers/motion/MotionDriver');

const TAG = 'MotionService';

/**
 * Provides a very abstract way to control and estimate robot position
 * @fires services.motion.MotionService#pathObstacleDetected
 * @memberOf services.position
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class MotionService extends EventEmitter {
    get DIRECTION_FORWARD() { return 1; }
    get DIRECTION_BACKWARD() { return -1; }
    get DIRECTION_NONE() { return 0; }

    init(config) {
        this.config = config;
        this.currentSpeed = 0;
        this.direction = this.DIRECTION_NONE;

        this.motionDriver = Mep.DriverManager.getDriver('MotionDriver');

        this.required = {
            points: [],
            params: {}
        };
        this.pathObstacleSources = [[], []];

        this._goToNextQueuedPoint = this._goToNextQueuedPoint.bind(this);

        // Subscribe on sensors that can provide obstacles on the robot's terrain
        Mep.DriverManager.callMethodByGroup('terrain', 'on', ['pathObstacleDetected', this._onPathObstacleDetected.bind(this)]);
    }

    getDirection() {
        return this.direction;
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
                    poi.rotate(new Point(0, 0), Mep.Position.getPosition());
                    poi.translate(Mep.Position.getPosition());

                    if (poi.getX() < 1500 && poi.getX() > -1500 &&
                        poi.getY() < 1000 && poi.getY() > -1000) {
                        // TODO: Check if it is not a static obstacle

                        /**
                         * Obstacle detected on robot's path
                         * @event services.motion.MotionService#pathObstacleDetected
                         * @property {Boolean} detected - True if obstacle is detected
                         */
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
     * @param {Boolean} params.pf - Use terrain finding algorithm
     * @param {String} params.direction - Direction of robot movement
     * @param {Boolean} params.relative - Use relative to previous position
     * @param {Number} params.tolerance - Position will consider as reached if Euclid's distance between current
     * and required position is less than tolerance
     * @param {Number} params.speed - Speed of the robot movement in range (0, 255)
     * @returns {Promise}
     */
    go(tunedPoint, params) {
        let destinationPoint = tunedPoint.getPoint();

        this.required = {
            params: {},
            points: []
        };
        Object.assign(this.required.params, this.config.moveOptions, params);


        // Apply relative
        if (this.required.params.relative === true) {
            destinationPoint.setX(destinationPoint.getX() + Mep.Position.getPosition().getX());
            destinationPoint.setY(destinationPoint.getY() + Mep.Position.getPosition().getY());
        }

        // Apply terrain finding
        if (this.required.params.pf === true) {
            let currentPoint = Mep.Position.getPosition();
            this.required.points = Mep.getTerrainService().findPath(currentPoint, destinationPoint);

            Mep.Log.debug(TAG, 'Start path finding from', currentPoint, 'to', this.required.points);
        } else {
            this.required.points = [destinationPoint];
        }

        return new Promise((resolve, reject) => {
            if (this.required.points.length === 0) {
                reject(new TaskError(TAG, 'FindPath', 'Cannot go to required position, no path found'));
            }
            this._goToNextQueuedPoint(resolve, reject);
        });
    }

    _goToNextQueuedPoint(resolve, reject) {
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
                this._goToNextQueuedPoint(resolve, reject);
            }).catch((e) => {
                reject(e);
            });
            return;
        }
        resolve();
    }

    _promiseToReachDestination(point, tolerance) {
        let motionService = this;

        return new Promise((resolve, reject) => {
            let onPositionChanged = (name, currentPosition) => {
                if (currentPosition.getDistance(point) <= tolerance) {
                    motionService.motionDriver.finishCommand();
                    resolve();
                    motionService.motionDriver.removeListener('positionChanged', onPositionChanged);
                }
            };

            let onStateChanged = (name, state) => {
                switch (state) {
                    case MotionDriver.STATE_IDLE:
                        resolve();
                        motionService.motionDriver.removeListener('stateChanged', onStateChanged);
                        break;
                    case MotionDriver.STATE_STUCK:
                        reject(new TaskError(TAG, 'stuck', 'Robot is stacked'));
                        motionService.motionDriver.removeListener('stateChanged', onStateChanged);
                        break;
                    case MotionDriver.STATE_ERROR:
                        reject(new TaskError(TAG, 'error', 'Unknown moving error'));
                        motionService.motionDriver.removeListener('stateChanged', onStateChanged);
                        break;
                }
            };

            // If tolerance is set to use Euclid's distance to determine if robot can execute next command
            // It is useful if you want to continue
            if (tolerance >= 0) {
                this.motionDriver.on('positionChanged', onPositionChanged);
            }

            // In every case wait new state of motion driver
            this.motionDriver.on('stateChanged', onStateChanged);
        });
    }

    _basicSet(point, direction, tolerance, speed) {
        Mep.Log.debug(TAG, 'Basic set',  point);

        // Set speed
        if (speed !== undefined && this.currentSpeed !== speed) {
            this.currentSpeed = speed;
            this.motionDriver.setSpeed(speed);
        }

        // Save direction
        this.direction = direction;

        // Move the robot
        if (tolerance < 0) {
            this.motionDriver.moveToPosition(point, direction);
        } else {
            this.motionDriver.moveToCurvilinear(point, direction);
        }

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
        this.direction = direction;
        this.motionDriver.moveArc(point, angle, direction);
        return this._promiseToReachDestination();
    }

    /**
     * Stop the robot
     * @param softStop - If true robot will turn of motors
     */
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
     * Move robot forward or backward depending on param `millimeters`
     * @param millimeters {Number} - Path that needs to be passed. If negative robot will go backward
     * @returns {Promise}
     */
    straight(millimeters) {
        this.direction = (millimeters > 0) ? this.DIRECTION_FORWARD : this.DIRECTION_BACKWARD;
        this.motionDriver.goForward(millimeters | 0);
        return this._promiseToReachDestination(null, -1);
    }

    /**
     * Rotate robot for an angle
     * @param tunedAngle {TunedAngle} - Angle to rotate
     * @param options {Object} - Additional options
     * @returns {Promise}
     */
    rotate(tunedAngle, options) {
        this.motionDriver.rotateTo(tunedAngle.getAngle());
        return this._promiseToReachDestination(null, -1);
    }
}

module.exports = MotionService;
