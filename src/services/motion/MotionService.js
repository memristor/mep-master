'use strict';
/** @namespace services.motion */

const TaskError = Mep.require('strategy/TaskError');
const EventEmitter = require('events').EventEmitter;
const Point = Mep.require('misc/Point');
const MotionDriver = Mep.require('drivers/motion/MotionDriver');
const MotionTargetQueue = require('./MotionTargetQueue');
const Line = Mep.require('misc/Line');

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
        this.config = Object.assign({
            hazardObstacleDistance: 200,
            timeToStop: 100,
            maxBypassTolerance: 50
        }, config);

        this.motionDriver = Mep.DriverManager.getDriver('MotionDriver');

        // Important for simulation
        this._targetQueue = new MotionTargetQueue((targets) => {
            Mep.Telemetry.send(TAG, 'TargetQueueChanged', targets);
        });
        Mep.Telemetry.send(TAG, 'HazardObstacleDistanceSet', {
            hazardObstacleDistance: this.config.hazardObstacleDistance
        });

        // Global resolve and reject used outside (strategies)
        this._resolve = null;
        this._reject = null;

        this._direction = this.DIRECTION_NONE;
        this._stopped = false;
        this._paused = false;
        this._obstacleDetectedTimeout = null;

        // Event method configuration
        this._goToNextQueuedTarget = this._goToNextQueuedTarget.bind(this);
        this._onObstacleDetected = this._onObstacleDetected.bind(this);
        this._onPositionChanged = this._onPositionChanged.bind(this);
        this._onStateChanged = this._onStateChanged.bind(this);

        // Subscribe on sensors that can provide obstacles on the robot's terrain
        Mep.Terrain.on('obstacleDetected', this._onObstacleDetected);
        this.motionDriver.on('positionChanged', this._onPositionChanged);
        this.motionDriver.on('stateChanged', this._onStateChanged);

        // Single subscriber events
        this._singleOnPositionChanged = null;
        this._singleOnStateChanged = null;
    }

    _onStateChanged(name, state) {
        if (this._singleOnStateChanged !== null) {
            this._singleOnStateChanged(name, state);
        }
    }

    _onPositionChanged(name, position) {
        if (this._singleOnPositionChanged !== null) {
            this._singleOnPositionChanged(name, position);
        }
    }

    getDirection() {
        return this._direction;
    }

    isStopped() {
        return this._stopped;
    }

    isPaused() {
        return this._paused;
    }

    _onObstacleDetected(poi, polygon) {
        let target = this._targetQueue.getTargetFront();
        if (target === null) return;
        let line = new Line(Mep.Position.getPosition(), target.getPoint());

        if (poi.getDistance(Mep.Position.getPosition()) < this.config.hazardObstacleDistance) {
            if (line.isIntersectWithPolygon(polygon) === true) {
                this._singleOnPositionChanged = null;
                this._singleOnStateChanged = null;
                Mep.Motion.stop();

                if (this._obstacleDetectedTimeout !== null) {
                    clearTimeout(this._obstacleDetectedTimeout);
                }
                this._obstacleDetectedTimeout = setTimeout(() => {
                    this._goToNextQueuedTarget();
                }, Mep.Config.get('obstacleMaxPeriod') + 100);
            }
        }

        // Detect if obstacle intersect path and try to design a new path
        if (line.isIntersectWithPolygon(polygon)) {
            // Redesign path
            let points = Mep.Terrain.findPath(Mep.Position.getPosition(), this._targetQueue.getPfTarget().getPoint());
            if (points.length > 0) {
                let params = this._targetQueue.getPfTarget().getParams();

                // Reduce tolerance to get better to get better bypass
                params.tolerance = params.tolerance > this.config.maxBypassTolerance ? this.config.maxBypassTolerance : params.tolerance;

                // Redesign a path
                this._targetQueue.empty();
                this._targetQueue.addPointsBack(points, params);

                // Start executing a new path
                this._singleOnPositionChanged = null;
                this._singleOnStateChanged = null;

                this._paused = false;
                if (params.tolerance == -1) {
                    this.stop().then(this._goToNextQueuedTarget);
                } else {
                    this.motionDriver.finishCommand();
                    this._goToNextQueuedTarget();
                }
            } else {
                Mep.Log.warn(TAG, 'Cannot redesign path, possible crash!');
                // There will be no crash if obstacle move away or
                // if robot stop thanks to `pathObstacleDetected` sensors
            }
        }
    }

    /**
     * Move the robot, set new position of the robot
     *
     * @param {TunedPoint} tunedPoint - Point that should be reached
     * @param {Boolean} parameters.pf - Use terrain finding algorithm
     * @param {String} parameters.direction - Direction of robot movement
     * @param {Boolean} parameters.relative - Use relative to previous position
     * @param {Number} parameters.tolerance - Position will consider as reached if Euclid's distance between current
     * and required position is less than tolerance
     * @param {Number} parameters.speed - Speed of the robot movement in range (0, 255)
     * @returns {Promise}
     */
    go(tunedPoint, parameters) {
        let point = tunedPoint.getPoint();
        let params = Object.assign({}, this.config.moveOptions, parameters);

        this._targetQueue.empty();

        // Apply relative
        if (params.relative === true) {
            point.translate(Mep.Position.getPosition());
        }

        // Apply path finding algorithm
        if (params.pf === true) {
            let currentPoint = Mep.Position.getPosition();
            this._targetQueue.addPointsBack(Mep.Terrain.findPath(currentPoint, point), params);
            Mep.Log.debug(TAG, 'Start path finding from', currentPoint, 'to', this._targetQueue.getTargets());
        } else {
            this._targetQueue.addPointBack(point, params)
        }

        return new Promise((resolve, reject) => {
            if (this._targetQueue.isEmpty()) {
                reject(new TaskError(TAG, 'PathFinding', 'Cannot go to required position, no path found'));
                return;
            }
            this._resolve = resolve;
            this._reject = reject;
            this._goToNextQueuedTarget();
        });
    }

    _goToNextQueuedTarget() {
        let motionService = this;
        if (this._targetQueue.isEmpty()) {
            this._resolve();
        } else {
            let target = this._targetQueue.getTargetFront();
            this._goSingleTarget(
                target.getPoint(),
                target.getParams()
            ).then(() => {
                if (motionService._stopped === false) {
                    motionService._targetQueue.removeFront();
                    motionService._goToNextQueuedTarget();
                }
            }).catch((e) => {
                if (e.action !== 'break') {
                    motionService._reject(e);
                }
            });
        }
    }

    _promiseToReachDestination(point, tolerance) {
        let motionService = this;

        return new Promise((resolve, reject) => {
            let onPositionChanged = (name, currentPosition) => {
                if (currentPosition.getDistance(point) <= tolerance) {
                    motionService._singleOnStateChanged = null;
                    motionService._singleOnPositionChanged = null;
                    motionService.motionDriver.finishCommand();
                    resolve();
                }
            };

            let onStateChanged = (name, state) => {
                switch (state) {
                    case MotionDriver.STATE_IDLE:
                        motionService._singleOnStateChanged = null;
                        motionService._singleOnPositionChanged = null;
                        resolve();
                        break;
                    case MotionDriver.STATE_STUCK:
                        motionService._singleOnStateChanged = null;
                        motionService._singleOnPositionChanged = null;
                        reject(new TaskError(TAG, 'stuck', 'Robot is stacked'));
                        break;
                    case MotionDriver.STATE_ERROR:
                        motionService._singleOnStateChanged = null;
                        motionService._singleOnPositionChanged = null;
                        reject(new TaskError(TAG, 'error', 'Unknown moving error'));
                        break;
                    case MotionDriver.STATE_BREAK:
                        motionService._singleOnStateChanged = null;
                        motionService._singleOnPositionChanged = null;
                        reject(new TaskError(TAG, 'break', 'Command is broken by another one'));
                        break;
                }
            };

            // If tolerance is set to use Euclid's distance to determine if robot can execute next command
            // It is useful if you want to continue
            if (tolerance >= 0) {
                this._singleOnPositionChanged = onPositionChanged;
                onPositionChanged('auto', Mep.Position.getPosition());
            }

            // In every case wait new state of motion driver
            this._singleOnStateChanged = onStateChanged;
        });
    }

    /**
     * Go to single point without advanced features
     * @param point {misc.Point} - Target point
     * @param params.direction {Number} - Direction
     * @param params.tolerance {Number} - Max radius
     * @param params.speed {Number} - Speed
     * @return {Promise}
     * @private
     */
    _goSingleTarget(point, params) {
        Mep.Log.debug(TAG, 'Simple target go',  point);
        this._stopped = false;
        this._paused = false;

        // Set speed
        if (params.speed !== undefined && this.motionDriver.getActiveSpeed() !== params.speed) {
            this.motionDriver.setSpeed(params.speed);
        }

        // Save direction
        this._direction = params.direction;

        // Move the robot
        if (params.tolerance < 0) {
            this.motionDriver.moveToPosition(point, params.direction);
        } else {
            this.motionDriver.moveToCurvilinear(point, params.direction);
        }

        // Check when robot reached the position
        return this._promiseToReachDestination(point, params.tolerance);
    }

    /**
     * Make a curve
     * @param point {Number} - Center of circle
     * @param angle {Number} - Angle
     * @param direction {Number} - Direction
     * @returns {Promise}
     */
    arc(point, angle, direction) {
        this._stopped = false;
        this._direction = direction;
        this.motionDriver.moveArc(point, angle, direction);
        return this._promiseToReachDestination();
    }

    /**
     * Stop the robot
     * @param softStop - If true robot will turn of motors
     */
    stop(softStop = false) {
        this._stopped = true;

        if (this._singleOnStateChanged !== null) {
            this._singleOnStateChanged(TAG, MotionDriver.STATE_BREAK);
        }

        if (softStop === true) {
            this.motionDriver.softStop();
        } else {
            this.motionDriver.stop();
        }

        return new Promise((resolve, reject) => {
            setTimeout(resolve, this.config.timeToStop);
        });
    }


    pause() {
        this._paused = true;
    }

    resume() {
        if (this._paused === true) {
            this._paused = false;
            this._goToNextQueuedTarget();
        }
    }

    /**
     * Move robot forward or backward depending on param `millimeters`
     * @param millimeters {Number} - Path that needs to be passed. If negative robot will go backward
     * @returns {Promise}
     */
    straight(millimeters) {
        this._stopped = false;
        this._direction = (millimeters > 0) ? this.DIRECTION_FORWARD : this.DIRECTION_BACKWARD;
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
        this._stopped = false;
        this.motionDriver.rotateTo(tunedAngle.getAngle());
        return this._promiseToReachDestination(null, -1);
    }
}

module.exports = MotionService;
