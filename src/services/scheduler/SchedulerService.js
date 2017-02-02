'use strict';
/** @namespace services.scheduler */

const Task = Mep.require('strategy/Task');

const TAG = 'SchedulerService';

/**
 * Implements algorithms to schedule task execution
 * @memberOf services.scheduler
 */
class SchedulerService {
    init(config) {

    }

    recommendNextTask(tasks) {
        let maxWeightTask = null;

        for (let i = 0; i < tasks.length; i++) {
            if ((maxWeightTask === null ||
                tasks[i].getWeight() > maxWeightTask.getWeight()) &&
                tasks[i].getState() === Task.READY) {
                maxWeightTask = tasks[i];
            }
        }

        return maxWeightTask;
    }
}

module.exports = SchedulerService;