const InitTask = require('./InitTask');
const SecondTask = require('./SecondTask');
const BaseScheduler = Mep.require('types/BaseScheduler');

class Scheduler extends BaseScheduler {
    constructor() {
        super();

        this.tasks = [
            new InitTask(this, 10000, 10, 1),
            new SecondTask(this, 1000, 10, 1)
        ];

        this.runTask(this.tasks[0]);
    }
}

module.exports = Scheduler;