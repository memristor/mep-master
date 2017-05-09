'use strict';
/** @namespace services.motion */

const TaskError = Mep.require('strategy/TaskError');
const EventEmitter = require('events').EventEmitter;
const Point = Mep.require('misc/Point');
const MotionDriver = Mep.require('drivers/motion/MotionDriver');
const MotionTargetQueue = require('./MotionTargetQueue');
const Line = Mep.require('misc/Line');
const Misc = Mep.require('misc/Misc');

const TAG = 'MotionService';

/**
 * Provides a very abstract way to control and estimate robot position
 * @fires services.motion.MotionService#pathObstacleDetected
 * @memberOf services.position
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class MotionService extends EventEmitter {
    init(config) {
        this.config = Object.assign({
            hazardObstacleDistance: 400,
            maxBypassTolerance: 50,
            targetLineOffset: 150,
            hazardAngleFront: [-70, 70],
            hazardAngleBack: [110, -110],
            epsilonRadius: 30
        }, config);

        this.motionDriver = Mep.getDriver('MotionDriver');

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

        this._paused = false;
        this._obstacleDetectedTimeout = null;
        this._pathObstacleDetectedTimeout = null;

        // Event method configuration
        this._goToNextQueuedTarget = this._goToNextQueuedTarget.bind(this);
        this._onObstacleDetected = this._onObstacleDetected.bind(this);
        this._onPathObstacleDetected = this._onPathObstacleDetected.bind(this);

        // Subscribe on sensors that can provide obstacles on the robot's terrain
        Mep.Terrain.on('obstacleDetected', this._onObstacleDetected);
    }

    isPaused() {
        return this._paused;
    }

    _onObstacleDetected(params) {
        let motionService = this;
        if (this._targetQueue.getTargetFront() === null) return;

        let hazardAngle = (this.motionDriver.getDirection() === MotionDriver.DIRECTION_FORWARD) ?
            this.config.hazardAngleFront : this.config.hazardAngleBack;

        // Hazard region
        if (Misc.isAngleInRange(hazardAngle[0], hazardAngle[1], params.relativePoi.getAngleFromZero()) &&
            params.relativePoi.getDistance(new Point(0, 0)) < this.config.hazardObstacleDistance) {

            if (this._obstacleDetectedTimeout !== null) {
                clearTimeout(this._obstacleDetectedTimeout);
            } else {
                this._onPathObstacleDetected(true);
            }

            this._obstacleDetectedTimeout = setTimeout(() => {
                this._obstacleDetectedTimeout = null;
                this._onPathObstacleDetected(false);
            }, Mep.Config.get('obstacleMaxPeriod') + 100);
        } else {
            /*
             TODO: Try to redesign a path
             if (target.getParams().rerouting === true) {
             this.tryRerouting();
             }
             */
        }
    }

    _onPathObstacleDetected(detected) {
        let target = this._targetQueue.getTargetFront();

        if (detected === true) {
            Mep.Motion.stop();
            Mep.Log.debug(TAG, 'Obstacle detected, robot stopped');

            this._pathObstacleDetectedTimeout = setTimeout(() => {
                Mep.Motion.forceReject();
            }, target.getParams().obstacle);
        } else {
            if (this._pathObstacleDetectedTimeout !== null) {
                clearTimeout(this._pathObstacleDetectedTimeout);
            }
            Mep.Motion.resume();
        }
    }

    tryRerouting() {
        let motionService = this;

        let pfTarget = this._targetQueue.getTargetBack();
        if (pfTarget !== null) {
            // Redesign path
            let points = Mep.Terrain.findPath(Mep.Position.getPosition(), pfTarget.getPoint());
            if (points.length > 0) {
                let params = pfTarget.getParams();

                // Reduce tolerance to get better to get better bypass
                params.tolerance = (params.tolerance > this.config.maxBypassTolerance) ?
                    this.config.maxBypassTolerance :
                    params.tolerance;

                // Redesign a path
                this._targetQueue.empty();
                this._targetQueue.addPointsBack(points, params);

                if (params.tolerance === -1) {
                    this.stop().then(() => {
                        motionService.resume();
                    });
                } else {
                    this.motionDriver.finishCommand();
                    this.resume();
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
     * @param {TunedPoint} tunedPoint Point that should be reached
     * @param {Object} [parameters] Configuration options.
     * @param {Boolean} [parameters.pf] Use terrain finding algorithm.
     * @param {Boolean} [parameters.backward] Set backward robot moving.
     * @param {Boolean} [parameters.rerouting] Enable rerouting during the movement.
     * @param {Boolean} [parameters.relative] Use relative to previous position.
     * @param {Number} [parameters.tolerance] Position will consider as reached if Euclid's distance between current
     * and required position is less than tolerance.
     * @param {Number} [parameters.speed] Speed of the robot movement in range (0, 255).
     * @param {Number} [parameters.obstacle] Time [ms] after command will be rejected (with TaskError.type === 'obstacle')
     * if obstacle is detected in hazard region
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
                reject(new TaskError(TAG, 'pf', 'Cannot go to required position, no path found'));
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
            if (this._resolve !== null) {
                this._resolve();
            }
        } else {
            let target = this._targetQueue.getTargetFront();
            this._goSingleTarget(target.getPoint(), target.getParams()).then(() => {
                motionService._targetQueue.removeFront();

                motionService._goToNextQueuedTarget();
            }).catch((e) => {
                if (e.action !== 'break') {
                    Mep.Log.error(TAG, e);
                    motionService._reject(e);
                }
            });
        }
    }

    /**
     * Go to single point without advanced features
     * @param {misc.Point} point Target point
     * @param {Object} params Additional options
     * @param {Boolean} [params.backward] Move robot backward
     * @param {Number} [params.tolerance] Max radius
     * @param {Number} [params.speed] Speed
     * @return {Promise}
     * @private
     */
    _goSingleTarget(point, params) {
        Mep.Log.debug(TAG, 'Simple target go',  point);
        this._paused = false;

        // Set speed
        if (params.speed !== undefined && this.motionDriver.getActiveSpeed() !== params.speed) {
            this.motionDriver.setSpeed(params.speed);
        }

        // Move the robot
        if (params.tolerance < 0) {
            return this.motionDriver.moveToPosition(
                point,
                params.backward ? -1 : 1
            );
        } else {
            return this.motionDriver.moveToCurvilinear(
                point,
                params.backward ? -1 : 1,
                params.radius,
                params.tolerance
            );
        }
    }

    /**
     * Stop the robot
     * @param {Boolean} softStop If true robot will turn of motors
     */
    stop(softStop = false) {
        this.pause();
        if (softStop === true) {
            return this.motionDriver.softStop();
        } else {
            return this.motionDriver.stop();
        }
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
     * @param {Number} millimeters Path that needs to be passed. If negative robot will go backward
     * @param {Object} params
     * @param {Number} params.speed
     * @returns {Promise}
     */
    straight(millimeters, params) {
        // Set speed
        if (params !== undefined && params.speed !== undefined && this.motionDriver.getActiveSpeed() !== params.speed) {
            this.motionDriver.setSpeed(params.speed);
        }

        return this.motionDriver.goForward(millimeters);
    }

    /**
     * Rotate robot for an angle
     * @param {TunedAngle} tunedAngle Angle to rotate
     * @param {Object} options Additional options
     * @returns {Promise}
     */
    rotate(tunedAngle, options) {
        return this.motionDriver.rotateTo(tunedAngle.getAngle());
    }

    forceReject() {
        if (this._reject !== null) {
            this._targetQueue.empty();
            this._reject(new TaskError(TAG, 'obstacle', 'Obstacle is too long in front of robot'));
        }
    }
}

module.exports = MotionService;