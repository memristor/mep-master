const Scheduler = Mep.require('strategy/Scheduler');
const Point = Mep.require('misc/Point');
const TunedPoint = Mep.require('strategy/TunedPoint');
const Delay = Mep.require('misc/Delay');
const lunar = Mep.getDriver('LunarCollector');

// Tasks
const InitTask = require('./InitTask');
const CollectBackRocketTask = require('./CollectBackRocketTask');
const CollectStartRocketTask = require('./CollectStartRocketTask');
const PushSideCartridgeTask = require('./PushSideCartridgeTask');
const PushMiddleCartridgeTask = require('./PushMiddleCartridgeTask');
const EjectStartCartridgeTask = require('./EjectStartCartridgeTask');
const Module1Task = require('./Module1Task');
const Module2Task = require('./Module2Task');
const Module3Task = require('./Module3Task');
const Module4Task = require('./Module4Task');
const Module5Task = require('./Module5Task');
const FinalTask = require('./FinalTask');

const TAG = 'DefaultScheduler';

class DefaultScheduler extends Scheduler {
    constructor() {
        super();

        this._finalTaskExecuted = false;
        this._finalTask = new FinalTask(this, { weight: 10000, time: 0 });
        this.tasks = [
            new InitTask(this, { weight: 10000, time: 10 }),

            new CollectStartRocketTask(this, { weight: 1000, time: 20 }),
            new PushMiddleCartridgeTask(this, { weight: 980, time: 10 }),

            // new Module1Task(this, { weight: 920, time: 10 }),
            // new Module2Task(this, { weight: 900, time: 10 }),
            new Module3Task(this, { weight: 780, time: 5 }),
            new Module5Task(this, { weight: 775, time: 5 }),
            new Module4Task(this, { weight: 770, time: 5 }),
            new PushSideCartridgeTask(this, { weight: 760, time: 5 }),

            new CollectBackRocketTask(this, { weight: 820, time: 20 }),
            new EjectStartCartridgeTask(this, { weight: 800, time: 10 })
        ];

        this._onTick = this._onTick.bind(this);
        this._push = this._push.bind(this);
        this._collect = this._collect.bind(this);
        this._collect2 = this._collect2.bind(this);

        // Init task is always first
        this.runTask(this.tasks[0]);

        // Common
        this.common.push = this._push;
        this.common.collect = this._collect;
        this.common.collect2 = this._collect2;
        this.common.terrain = {
            startRocketModules: 4,
            backRocketModules: 4,
            middleCartridgeModules: 0,
            sideCartridgeModules: 0,
            startCartridgeModules: 0
        };
        this.common.robot = {
            colorfulModules: 0,
            monochromeModules: 0
        };

        // Last task
        this._starterDriver = Mep.getDriver('StarterDriver');
        this._starterDriver.on('tick', this._onTick);
    }

    _onTick(secondsPassed) {
        console.log('Time passed', secondsPassed);
        if (secondsPassed > 88 && this._finalTaskExecuted === false) {
            this.runTask(this._finalTask);
            this._finalTaskExecuted = true;
        }
    }

    async _push() {
        // We can rotate one module
        if (this.common.robot.colorfulModules >= 1) {
            try { await lunar.rotate(); } catch (e) {}
            this.common.robot.colorfulModules--;
        }

        try { await lunar.limiterOpenSafe(); } catch (e) {}
        try { await lunar.collect(); } catch (e) {}

        // Wait to empty
        await Delay(1000);
        for (let i = 0; i < 20; i++) {
            await Delay(300);
            if (lunar.isEmpty() === true) {
                break;
            }

            // Go up-down with limiter
            if (lunar.isLastOnly() === true) {
                if (i % 5 === 0) {
                    lunar.limiterOpen();
                } else {
                    lunar.limiterPrepare();
                }
            }
        }
        lunar.limiterOpen();
        await Delay(200);
        await Mep.Motion.straight(30);
        await Mep.Motion.straight(-30);

        // Last module
        lunar.prepare().catch(() => {});
        lunar.trackStop();
        await Mep.Motion.straight(100);
    }

    async _collect2() {
        try {
            lunar.limiterClose().catch((e) => {
                Mep.Log.error(TAG, 'Lunar.closeLimiter', e);
            });
            for (let i = 0; i < 2; i++) {
                try {
                    await lunar.collect();
                } catch (e) {
                    Mep.Log.error(TAG, 'Lunar.collect', e);
                }
                try {
                    await Mep.Motion.straight(-40);
                } catch (e) {
                    Mep.Log.error(TAG, 'Motion.straight', e);
                }
                await Delay(1500);
                lunar.prepare().catch((e) => {
                    Mep.Log.error(TAG, 'Lunar.prepare', e);
                });
                try {
                    await Mep.Motion.straight(40)
                } catch (e) {
                    Mep.Log.error(TAG, 'Motion.straight', e);
                }

                if (lunar.numberOfModules() === 0) {
                    i--;
                }
            }
            lunar.trackStop();
        } catch (e) {
            Mep.Log.error(TAG, e);
        }
    }

    async _collect() {
        try {
            await this._collect2();

            try { await lunar.collect(); } catch (e) { Mep.Log.error(TAG, 'Lunar.collect', e); }
            await Delay(2000);
            lunar.prepare().catch(() => { Mep.Log.error(TAG, 'Lunar.prepare', e); });
            await Delay(1000);

            try { await lunar.collect(); } catch (e) { Mep.Log.error(TAG, 'Lunar.collect', e); }
            await Delay(500);
            lunar.hold();
            lunar.trackStop();
        } catch (e) {
            Mep.Log.error(TAG, e);
        }
    }
}

module.exports = DefaultScheduler;