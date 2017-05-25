const Scheduler = Mep.require('strategy/Scheduler');
const Point = Mep.require('misc/Point');
const TunedPoint = Mep.require('strategy/TunedPoint');
const Delay = Mep.require('misc/Delay');

// Drivers
const starterDriver = Mep.getDriver('StarterDriver');
const ballPicker = Mep.getDriver('BallPicker');

// Tasks
const InitTask = require('./InitTask');
const FinalTask = require('./FinalTask');
const SmallHoleTask = require('./SmallHoleTask');
const LeaveBallTask = require('./LeaveBallsTask');

const TAG = 'DefaultScheduler';

class DefaultScheduler extends Scheduler {
    constructor() {
        super();

        // You have to have init and final task
        this._finalTaskExecuted = false;
        this._finalTask = new FinalTask(this);
        this._initTask = new InitTask(this);

        // Array of tasks. Note that init and final tasks are not included in this array.
        this.tasks = [
            new SmallHoleTask(this, { weight: 10000, time: 10 }),
            new LeaveBallTask(this, { weight: 1000, time: 10 })
        ];

        this._onTick = this._onTick.bind(this);
        this._onMessage = this._onMessage.bind(this);

        // Subscribe on ticks
        starterDriver.on('tick', this._onTick);

        this.common.colorRotate = this._colorRotate;
        this.common.pick = this._pick;
        this.common.leave = this._leave;

        this.common.robot = {
            ballsLoaded: false
        };
        this.common.leaveBallEnabled = false;

        // Init task is always first
        this.runTask(this._initTask);

        Mep.Share.on('message', this._onMessage);
    }

    _onMessage(message) {
        if (message.leaveBallEnabled !== undefined) {
            this.common.leaveBallEnabled = message.leaveBallEnabled;
        }
    }

    _onTick(secondsPassed) {
        if (secondsPassed > 88 && this._finalTaskExecuted === false) {
            this.scheduler.disable();
            this.runTask(this._finalTask);
            this._finalTaskExecuted = true;
        }
    }

    async _colorRotate() {

    }

    async _pick() {
        ballPicker.setPosition(100);
        await Delay(500);
        ballPicker.setPosition(400);
        await Delay(500);
    }

    async _leave() {
        ballPicker.setPosition(100);
        await Delay(500);
        ballPicker.setPosition(400);
        await Delay(500);
    }
}

module.exports = DefaultScheduler;
