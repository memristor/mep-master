const schedulerService = Mep.getSchedulerService();

const TAG = 'Scheduler';

class Scheduler {
    constructor() {
        process.on('unhandledRejection', this.onUnhandledTaskError.bind(this));
    }

    /**
     * Run default action if there is the exception in task is not caught with `try {} catch(e) {}`.
     * @param {TaskError} reason - Describes more about an exception
     */
    onUnhandledTaskError(reason) {
        if (reason !== undefined && reason.constructor !== undefined) {
            if (reason.constructor.name === 'TaskError') {
                Mep.Log.warn(TAG, reason);
                this.runNextTask();
            }
        }
    }

    getTasks() {
        return this.tasks;
    }

    runNextTask() {
        let nextTask = schedulerService.recommendNextTask(this.tasks);
        if (nextTask !== null) {
            this.runTask(nextTask);
        }
    }

    runTask(task) {
        task.run();
    }
}

module.exports = Scheduler;