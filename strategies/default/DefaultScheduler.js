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

const TAG = 'DefaultScheduler';

class DefaultScheduler extends Scheduler {
    constructor() {
        super();

        this.tasks = [
            new InitTask(this, { weight: 10000, time: 10, location: new Point(0, 0) }),

            new CollectStartRocketTask(this, { weight: 1000, time: 10, location: new Point(0, 0) }),
            new PushMiddleCartridgeTask(this, { weight: 980, time: 10, location: new Point(0, 0) }),
            new CollectBackRocketTask(this, { weight: 960, time: 10, location: new Point(0, 0) }),
            new EjectStartCartridgeTask(this, { weight: 940, time: 10, location: new Point(0, 0) }),
        ];

        // Init task is always first
        this.runTask(this.tasks[0]);

        // Common
        this.common.push = this.push;
        this.common.collect = this.collect;
    }

    async push() {
        try { await lunar.openLimiter(); } catch (e) {}
        await Delay(500);
        try { await lunar.collect(); } catch (e) {}
        await Delay(5500);

        // Last module
        lunar.prepare().catch(() => {});
        lunar.stopTrack();
        await Mep.Motion.straight(100);
    }

    async collect() {
        try {
            lunar.closeLimiter().catch((e) => { Mep.Log.error(TAG, 'Lunar.closeLimiter', e); });
            for (let i = 0; i < 2; i++) {
                try { await lunar.collect(); } catch (e) { Mep.Log.error(TAG, 'Lunar.collect', e); }
                try { await Mep.Motion.straight(-40); } catch (e) {}
                await Delay(1500);
                lunar.prepare().catch((e) => { Mep.Log.error(TAG, 'Lunar.prepare', e); });
                try { await Mep.Motion.straight(40) } catch (e) {}
            }
            try { await lunar.collect(); } catch (e) { Mep.Log.error(TAG, 'Lunar.collect', e); }
            await Delay(2000);
            lunar.prepare().catch(() => { Mep.Log.error(TAG, 'Lunar.prepare', e); });
            await Delay(1000);

            try { await lunar.collect(); } catch (e) { Mep.Log.error(TAG, 'Lunar.collect', e); }
            await Delay(500);
            lunar.hold().catch((e) => { Mep.Log.error(TAG, 'Lunar.hold', e); });

            try { await lunar.stopTrack(); } catch (e) { Mep.Log.error(TAG, 'Lunar.stopTrack', e); }
        } catch (e) {
            Mep.Log.error(TAG, e);
        }
    }
}

module.exports = DefaultScheduler;
