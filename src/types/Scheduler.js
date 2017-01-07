const schedulerService = Mep.getSchedulerService();

class Scheduler {
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