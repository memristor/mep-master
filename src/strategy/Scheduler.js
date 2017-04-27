'use strict';
/** @namespace strategy */

const TAG = 'Scheduler';

/**
 * Default scheduler class describes general task scheduling and robot behaviour
 * @memberOf strategy
 * @example
 * class MyScheduler extends Scheduler {
 *  constructor() {
 *      this.tasks = [
 *          new InitTask(this, { weight: 10000, time: 10, location: new Point(0, 0) })
 *      ];
 *  }
 *  runNextTask() {
 *      // Here you can override default scheduler
 *  }
 * }
 */
class Scheduler {
    constructor() {
        this.tasks = [];

        process.on('unhandledRejection', this.onUnhandledTaskError.bind(this));

        this.common = {};
        this._timeIsUp = false;
    }

    /**
     * Run default action if there is the exception in task is not caught with `try {} catch(e) {}`.
     * @param {TaskError} reason Describes more about an exception
     */
    onUnhandledTaskError(reason) {
        if (reason !== undefined && reason.constructor !== undefined) {
            if (reason.constructor.name === 'TaskError') {
                Mep.Log.warn(TAG, reason);
                // this.runNextTask();
            }
        } else {
            throw Error(reason);
        }
    }

    /**
     * Get all registered task
     * @returns {Array} Array of tasks type Task
     */
    getTasks() {
        return this.tasks;
    }

    runNextTask() {
        let nextTask = Mep.Scheduler.recommendNextTask(this.tasks);
        if (nextTask !== null) {
            if (this._timeIsUp === false) {
                this.runTask(nextTask);
            } else {
                Mep.Log.info(TAG, 'Tasks are blocked, time\'s up');
            }
        } else {
            Mep.Log.info(TAG, 'No more tasks');
        }
    }

    runTask(task) {
        Mep.Log.info(TAG, task.constructor.name);
        task.run();
    }
}

module.exports = Scheduler;