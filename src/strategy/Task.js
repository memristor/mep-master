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
     * @param scheduler {Scheduler} - Reference to strategy's scheduler
     * @param weight {Number} - Importance of the task, initial order
     * @param time {Number} - Predicted time to be executed
     * @param location - Predicted area of execution
     */
    constructor(scheduler, weight, time, location) {
        this.state = Task.READY;
        this.weight = weight;
        this.time = time;
        this.location = location;
        this.scheduler = scheduler;

        this.pathObstacleDetected = false;
        Mep.Position.on('pathObstacleDetected', this.onPathObstacle.bind(this));
    }

    /**
     * Finish this task and run next one
     */
    finish() {
        let lastState = this.state;
        this.state = Task.FINISHED;
        if (lastState !== Task.FINISHED) {
            this.scheduler.runNextTask();
        }
    }

    /**
     * Suspend this task and run next one
     */
    suspend() {
        let lastState = this.state;
        this.state = Task.SUSPENDED;
        if (lastState !== Task.SUSPENDED) {
            this.scheduler.runNextTask();
        }
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
        this.pathObstacleDetected = detected;
        if (this.pathObstacleDetected === true) {
            Mep.Position.stop();
        } else {
            Mep.Position.continue();
        }
    }
}

module.exports = Task;
