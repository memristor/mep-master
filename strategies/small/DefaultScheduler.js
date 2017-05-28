const Scheduler = Mep.require('strategy/Scheduler');
const Point = Mep.require('misc/Point');
const TunedPoint = Mep.require('strategy/TunedPoint');
const Delay = Mep.require('misc/Delay');

// Drivers
const starterDriver = Mep.getDriver('StarterDriver');
const ballPicker = Mep.getDriver('BallPicker');
const directionBall = Mep.getDriver('DirectionBall');
const colorIrSensor = Mep.getDriver('ColorIrSensor');

// Tasks
const InitTask = require('./InitTask');
const FinalTask = require('./FinalTask');
const SmallHoleTask = require('./SmallHoleTask');
const LeaveBallTask = require('./LeaveBallsTask');
const LeaveRampTask = require('./LeaveRampTask');
const DragModuleTask = require('./DragModuleTask');
const TestTask = require('./TestTask');

const TAG = 'DefaultScheduler';

class DefaultScheduler extends Scheduler {
    constructor() {
        super();

        // You have to have init and final task
        this._finalTaskExecuted = false;
        this._finalTask = new FinalTask(this);
        this._initTask = new InitTask(this);
        // this._initTask = new TestTask(this);

        // Array of tasks. Note that init and final tasks are not included in this array.
        this.tasks = [

            new LeaveRampTask(this, { weight: 9999999 }),
            // new TestTask(this, { weight: 700, time: 1 }),

            new DragModuleTask(this, {weight: 800 }),
            // new SmallHoleTask(this, { weight: 1000, time: 10 }),
            // new LeaveBallTask(this, { weight: 900, time: 10 })
        ];

        this._onTick = this._onTick.bind(this);
        this._onMessage = this._onMessage.bind(this);

        // Drivers
        this._colorRotator = Mep.getDriver('ColorRotator');
        this._colorRamp = Mep.getDriver('ColorRamp');
        this._colorSensor = Mep.getDriver('ColorSensor');

        // Subscribe on ticks
        starterDriver.on('tick', this._onTick);

        this.common.colorRotate = this._colorRotate.bind(this);
        this.common.colorUp = this._colorUp.bind(this);
        this.common.pick = this._pick;
        this.common.leave = this._leave;

        this.common.liftDirBall = this._liftDirBall.bind(this);
        this.common.lowerDirBall = this._lowerDirBall.bind(this);

        this.common._liftPicker = this._liftPicker.bind(this);
        this.common._lowerPicker = this._lowerPicker.bind(this);

        this.common.robot = {
            ballsLoaded: false
        };

        let test = false;
        this.common.leaveBallEnabled = test;
        this.common.leaveStartEnabled = test;

        // Init task is always first
        this.runTask(this._initTask);

        Mep.Share.on('message', this._onMessage);
    }

    _onMessage(message) {
        console.log(message);
        if (message.leaveBallEnabled !== undefined) {
            this.common.leaveBallEnabled = message.leaveBallEnabled;
        } else if (message.leaveStartEnabled !== undefined) {
            this.common.leaveStartEnabled = message.leaveStartEnabled;
        }
    }

    _liftDirBall() {
        directionBall.setPosition(100);
    }

    _lowerDirBall() {
        directionBall.setPosition(512);
    }

    _onTick(secondsPassed) {
        if (secondsPassed > 88 && this._finalTaskExecuted === false) {
            this.disable();
            this.runTask(this._finalTask);
            this._finalTaskExecuted = true;
        }
    }

    async _colorTmpUp() {
        this._colorRamp.setSpeed(300);
        this._colorRamp.setPosition(20);
        // this._colorRotator.write(250);
        this._colorSensor.stop();
    }

    async _colorUp() {
        this._colorRamp.setSpeed(300);
        this._colorRamp.setPosition(20);
        this._colorRotator.write(255);
        this._colorSensor.stop();
        await Delay(500);
        // this._colorRamp.setPosition(40);
    }

    async _colorDown() {
        this._colorRamp.setSpeed(500);
        this._colorRamp.setPosition(250);
        await Delay(500);
        this._colorRamp.setSpeed(150);
        this._colorRamp.setPosition(280);
        await Delay(100);
        this._colorRamp.setPosition(280);
        this._colorSensor.start(30);
        this._colorRotator.write(150);
        await Delay(500);

    }

    async _colorRotate() {
        let scheduler = this;
        let timeout = 5000;
        let requiredColor = (Mep.Config.get('table').indexOf('blue') >= 0) ? 'blue' : 'yellow';

        await this._colorDown();

        // Rotate until color
        return new Promise((resolve, reject) => {
            let colorSensor = this._colorSensor;
            let colorChangedPromise = (color) => {
                if (color === requiredColor) {
                    colorSensor.removeListener('changed', colorChangedPromise);
                    setTimeout(resolve, 150); // Resolve with delay
                    scheduler._colorTmpUp();
                }
            };

            this._colorSensor.on('changed', colorChangedPromise);
            setTimeout(() => {
                resolve();
                scheduler._colorTmpUp();
                colorSensor.removeListener('changed', colorChangedPromise);
            }, timeout);
        });
    }

    _lowerPicker() {
        ballPicker.setSpeed(500);
        ballPicker.setPosition(100);
    }

    _liftPicker(speed=500) {
        ballPicker.setSpeed(speed);
        ballPicker.setPosition(400);
    }

    async _pick() {
        ballPicker.setSpeed(500);
        ballPicker.setPosition(100);
        await Delay(700);
        ballPicker.setSpeed(100);
        ballPicker.setPosition(400);
        await Delay(500);
    }

    async _leave() {
        ballPicker.setPosition(100);
        await Delay(900);
        var good = false;
        while(!good) {
            try {
                await Mep.Motion.straight(150);
                good=true;
            } catch(e) {
                good=false;
            }
        }
        ballPicker.setSpeed(500);
        ballPicker.setPosition(400);
        await Delay(600);
    }
}

module.exports = DefaultScheduler;
