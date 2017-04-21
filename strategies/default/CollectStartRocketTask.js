const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const Delay = Mep.require('misc/Delay');
const Point = Mep.require('misc/Point');
const lunar = Mep.getDriver('LunarCollector');
const Console = require('./Console');

const TAG = 'CollectStartRocketTask';

class CollectStartRocketTask extends Task {
    async onRun() {
        try {
            await Mep.Motion.go(new TunedPoint(-360, -750), { speed: 70, backward: false });
            // await Mep.Motion.rotate(new TunedAngle(-90));

            await this.common.collect();
            await Mep.Motion.go(new TunedPoint(-360, -590), { speed: 90, backward: true, tolerance: 40, radius: 100 });
            // await Mep.Motion.go(new TunedPoint(-360, -600), {speed: 70, backward: true});

        } catch (e) {
            Mep.Log.error(TAG, e);
        }

        this.finish();
    }
}

module.exports = CollectStartRocketTask;
