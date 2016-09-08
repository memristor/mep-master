const InitTask = require('./InitTask');

class Scheduler {
    constructor() {
        this.tasks = [
            {
                task: (new InitTask()),
                weight: 10000,
                time: 10,
                state: 'Ready',
                location: 1
            }
        ];
    }

    getTasks() {
        return this.tasks;
    }

    findBestTask() {
        return this.tasks[0];
    }

    runTask(task) {
        task.task.run();
    }
}

module.exports = Scheduler;