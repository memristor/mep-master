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
            location: new Point(0, 0)
        }, parameters);

        this.state = Task.READY;
        this.weight = this.params.weight;
        this.time = this.params.time;
        this.location = this.params.location;
        this.scheduler = scheduler;
        this.common = scheduler.common;
    }

    /**
     * Finish this task and run next one
     */
    finish() {
        this.scheduler.setPreviousTask(this.constructor.name);
        this.state = Task.FINISHED;
        this.scheduler.runNextTask();
    }

    /**
     * Suspend this task and run next one
     */
    suspend() {
        this.scheduler.setPreviousTask(this.constructor.name);
        this.state = Task.SUSPENDED;
        this.scheduler.runNextTask();
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
     * @returns {Number} Can be Task.READY, Task.SUSPENDED, Task.ACTIVE and Task.FINISHED
     */
    getState() {
        return this.state;
    }

    /**
     * Set current state
     * @param {Number} state Can be Task.READY, Task.SUSPENDED, Task.ACTIVE and Task.FINISHED
     */
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
     * Change priority during runtime
     * @returns {number}
     */
    plusPriority() {
        return 0;
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
}

module.exports = Task;
