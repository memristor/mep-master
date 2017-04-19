const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const Delay = Mep.require('misc/Delay');
const Point = Mep.require('misc/Point');
const lunar = Mep.getDriver('LunarCollector');
const Console = require('./Console');

const TAG = 'CollectBackRocketTask';

class CollectBackRocketTask extends Task {
    async onRun() {
        try {
            await Mep.Motion.go(new TunedPoint(-1100, 370), {speed: 70, backward: false});
            await Mep.Motion.go(new TunedPoint(-1240, 370), {speed: 70, backward: false});
            await this.common.collect();
            await Mep.Motion.go(new TunedPoint(-1100, 370), {speed: 70, backward: true});

        } catch (e) {
            Mep.Log.error(TAG, e);
        }
        this.finish();
    }
}

module.exports = CollectBackRocketTask;
