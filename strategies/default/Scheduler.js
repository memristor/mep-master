const InitTask = require('./InitTask');

class Scheduler {
    constructor() {
        this.tasks = [
            new InitTask(10000, 10, 1),
        ];
    }

    getTasks() {
        return this.tasks;
    }

    findBestTask() {
        return this.tasks[0];
    }

    runTask(task) {
        task.run();
    }
}

module.exports = Scheduler;