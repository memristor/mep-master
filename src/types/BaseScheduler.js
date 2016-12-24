const scheduler = Mep.getSchedulerService();

class BaseScheduler {
    getTasks() {
        return this.tasks;
    }

    runNextTask() {
        let nextTask = scheduler.recommendNextTask(this.tasks);
        if (nextTask !== null) {
            this.runTask(nextTask);
        }
    }

    runTask(task) {
        task.run();
    }
}

module.exports = BaseScheduler;