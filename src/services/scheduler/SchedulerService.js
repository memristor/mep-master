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
            Mep.Log.error(TAG,
                tasks[i].constructor.name,
                tasks[i].getWeight() + tasks[i].plusPriority(),
                tasks[i].getState(),
                tasks[i].getTime(),
                tasks[i].isAvailable()
            );

            if ((maxWeightTask === null ||
                tasks[i].getWeight() + tasks[i].plusPriority() > maxWeightTask.getWeight() + maxWeightTask.plusPriority()) &&
                tasks[i].getState() === Task.READY &&
                tasks[i].getTime() < this.starterDriver.getRemainingTime() &&
                tasks[i].isAvailable() === true) {
                maxWeightTask = tasks[i];
            }

            if (tasks[i].getState() === Task.SUSPENDED) {
                tasks[i].setState(Task.READY);
            }
        }

        if (maxWeightTask === null) {
            Mep.Log.error(TAG, 'Cannot suggest next task');
        }

        Mep.Log.debug(TAG, 'Remaining time', this.starterDriver.getRemainingTime());

        return maxWeightTask;
    }
}

module.exports = SchedulerService;