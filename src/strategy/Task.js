'use strict';
/** @namespace strategy */

const Point = Mep.require('misc/Point');

const TAG = 'Task';

/**
 * Default task class describes general task robot behaviour during task execution
 * @memberOf strategy
 */
class Task {
    /**
     * Task is ready to be executed
     */
    static get READY() {
        return 1;
    }

    /**
     * Task is suspended and waiting a chance to become ready
     */
    static get SUSPENDED() {
        return 2;
    }

    /**
     * Task is executing
     */
    static get ACTIVE() {
        return 3;
    }

    /**
     * Task is finished and it is not be consider in the future
     */
    static get FINISHED() {
        return 4;
    }

    /**
     * Default constructor for task
     * @param scheduler {Scheduler} Reference to strategy's scheduler
     * @param {Object} parameters Additional params
     * @param {Number} parameters.weight Importance of the task, initial order
     * @param {Number} parameters.time Predicted time to be executed
     * @param {misc.Point} parameters.location Predicted area of execution
     */
    constructor(scheduler, parameters) {
        this.params = Object.assign({
            weight: 0,
            time: 20,
            location: new Point(0, 0),
            avoidanceStrategy: 'stop', // stop, rerouting, skip
            avoidanceStrategyDelay: 2000
        }, parameters);

        this.state = Task.READY;
        this.weight = this.params.weight;
        this.time = this.params.time;
        this.location = this.params.location;
        this.scheduler = scheduler;
        this.common = scheduler.common;

        this.pathObstacleDetected = false;

        this._obstacleDetectedTimeout = null;
        this.onPathObstacle = this.onPathObstacle.bind(this);
    }

    /**
     * Finish this task and run next one
     */
    finish() {
        this.state = Task.FINISHED;
        this.scheduler.runNextTask();
        Mep.Motion.removeListener('pathObstacleDetected', this.onPathObstacle);
    }

    /**
     * Suspend this task and run next one
     */
    suspend() {
        this.state = Task.SUSPENDED;
        this.scheduler.runNextTask();
        Mep.Motion.removeListener('pathObstacleDetected', this.onPathObstacle);
    }

    /**
     * Get weight of current task
     * @returns {Number}
     */
    getWeight() {
        return this.weight;
    }

    /**
     * Get predicted time of current task
     * @returns {Number}
     */
    getTime() {
        return this.time;
    }

    /**
     * Get current state
     * @returns {Number} - Can be Task.READY, Task.SUSPENDED, Task.ACTIVE and Task.FINISHED
     */
    getState() {
        return this.state;
    }

    setState(state) {
        this.state = state;
    }

    /**
     * Change default weight of the task
     * @param weight {Number}
     */
    setWeight(weight) {
        this.weight = weight;
    }

    /**
     * Run current task and change a state
     */
    run() {
        this.state = Task.ACTIVE;
        this.onRun();

        Mep.Motion.on('pathObstacleDetected', this.onPathObstacle);
    }

    /**
     * This method will be executed as soon as mep run this task
     */
    onRun() {
        Mep.Log.error(TAG, 'Override onRun() please.');
    }


    /**
     * Condition which will be checked by SchedulerService to decide to run task or not.
     * Eg. Release lunar modules only if there is lunar modules inside robot
     * @returns {Boolean} Returns true if task is ready to be executed
     */
    isAvailable() {
        return true;
    }

    /**
     * Change avoidance strategy during task execution
     * @param {String} strategy Can be: 'stop', 'rerouting' or 'skip'
     * @param {Number} delay
     */
    setAvoidanceStrategy(strategy, delay) {
        this.params.avoidanceStrategy = strategy;
        this.params.avoidanceStrategyDelay = delay;
    }

    /**
     * This method will be executed when some obstacle is detected on the path
     * @param detected
     */
    onPathObstacle(detected) {
        let task = this;

        if (detected === true) {
            Mep.Motion.stop();
            Mep.Log.debug(TAG, 'Obstacle detected, robot stopped');

            this._obstacleDetectedTimeout = setTimeout(() => {
                switch (this.params.avoidanceStrategy) {
                    case 'stop':
                        Mep.Log.info(TAG, 'Maybe to implement different avoidance strategy');
                        break;

                    case 'rerouting':
                        Mep.Motion.tryRerouting();
                        break;

                    case 'skip':
                        Mep.Motion.forceReject();
                        // task.finish();
                        break;

                    default:
                        Mep.Log.error(TAG, 'Invalid avoidance strategy', this.params.avoidanceStrategy);
                        break;
                }
            }, this.params.avoidanceStrategyDelay);
        } else {
            clearTimeout(this._obstacleDetectedTimeout);
            Mep.Motion.resume();
        }
    }
}

module.exports = Task;
