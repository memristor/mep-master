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
            //lunar.close();
            await Mep.Motion.go(
                new TunedPoint(-365, -750, [ 350, -750, 'blue' ]),
                { speed: 70, backward: false });
            await Mep.Motion.rotate(new TunedAngle(-90));

            await this.common.collect();
            await Mep.Motion.straight(-30);

            this.finish();
        } catch (e) {
            Mep.Log.error(TAG, e);
            this.suspend();
        }
    }
}

module.exports = CollectStartRocketTask;
