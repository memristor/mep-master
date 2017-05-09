const Scheduler = Mep.require('strategy/Scheduler');
const Point = Mep.require('misc/Point');
const TunedPoint = Mep.require('strategy/TunedPoint');
const Delay = Mep.require('misc/Delay');

// Tasks
const InitTask = require('./InitTask');
const FinalTask = require('./FinalTask');
const SampleTask = require('./SampleTask');


const TAG = 'DefaultScheduler';

class DefaultScheduler extends Scheduler {
    constructor() {
        super();

        this._finalTaskExecuted = false;
        this._finalTask = new FinalTask(this);
        this._initTask = new InitTask(this);
        this.tasks = [
            new SampleTask(this, { weight: 10000, time: 10 })
        ];

        this._onTick = this._onTick.bind(this);

        // Init task is always first
        this.runTask(this._initTask);
    }

    _onTick(secondsPassed) {
        if (secondsPassed > 88 && this._finalTaskExecuted === false) {
            this.runTask(this._finalTask);
            this._finalTaskExecuted = true;
        }
    }
}

module.exports = DefaultScheduler;