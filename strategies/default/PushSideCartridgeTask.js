const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const Delay = Mep.require('misc/Delay');
const Point = Mep.require('misc/Point');
const lunar = Mep.getDriver('LunarCollector');
const Console = require('./Console');

const TAG = 'PushSideCartridgeTask';

class PushSideCartridgeTask extends Task {
    async onRun() {
        try {
            await Mep.Motion.go(new TunedPoint(-870, 80), { backward: true });
            await Mep.Motion.go(new TunedPoint(-650, 310), { speed: 70, backward: true });
            await this.common.push();

            this.finish();
        } catch (e) {
            Mep.Log.error(TAG, e);
            this.suspend();
        }
    }
}

module.exports = PushSideCartridgeTask;
