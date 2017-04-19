'use strict';
/** @namespace strategy */

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
     * @param {Object} params Additional params
     * @param {Number} params.weight Importance of the task, initial order
     * @param {Number} params.time Predicted time to be executed
     * @param {misc.Point} params.location Predicted area of execution
     */
    constructor(scheduler, params) {
        this.state = Task.READY;
        this.weight = params.weight;
        this.time = params.time;
        this.location = params.location;
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
        Mep.Log.warn(TAG, 'Override onRun() please.');
    }

    /**
     * This method will be executed when some obstacle is detected on the path
     * @param detected
     */
    onPathObstacle(detected) {
        if (detected === true) {
            Mep.Motion.stop();

            this._obstacleDetectedTimeout = setTimeout(() => {
                Mep.Log.info(TAG, 'Maybe to add rerouting now?');
                //Mep.Motion.tryRerouting();
            }, 2000);
        } else {
            clearTimeout(this._obstacleDetectedTimeout);
            Mep.Motion.resume();
        }

        Mep.Log.debug(TAG, 'onPathObstacle', detected);
    }
}

module.exports = Task;
