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
        this.starterDriver = Mep.getDriver('StarterDriver');
    }

    /**
     * Algorithm to choose the best task
     * @param {Array<strategy.Task>} tasks Array of available tasks
     * @returns strategy.Task
     */
    recommendNextTask(tasks) {
        let maxWeightTask = null;

        for (let i = 0; i < tasks.length; i++) {
            if ((maxWeightTask === null ||
                tasks[i].getWeight() > maxWeightTask.getWeight()) &&
                tasks[i].getState() === Task.READY &&
                tasks[i].getTime() < this.starterDriver.getRemainingTime()) {
                maxWeightTask = tasks[i];
            }
        }

        if (maxWeightTask === null) {
            Mep.Log.error(TAG, 'Cannot suggest next task');
        }

        return maxWeightTask;
    }
}

module.exports = SchedulerService;