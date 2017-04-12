const InitTask = require('./InitTask');
const SecondTask = require('./SecondTask');
const Scheduler = Mep.require('strategy/Scheduler');
const Point = Mep.require('misc/Point');

class DefaultScheduler extends Scheduler {
    constructor() {
        super();

        this.tasks = [
            new InitTask(this, { weight: 10000, time: 10, location: new Point(0, 0) }),
            new SecondTask(this, { weight: 1000, time: 10, location: new Point(0, 0) })
        ];

        this.runTask(this.tasks[0]);
    }
}

module.exports = DefaultScheduler;
