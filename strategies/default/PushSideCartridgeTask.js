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
            await Mep.Motion.go(new TunedPoint(-710, 250), {speed: 70, backward: true});
            await Mep.Motion.rotate(new TunedAngle(225));

            await this.common.push();
        } catch (e) {
            Mep.Log.error(TAG, e);
        }

        this.finish();
    }
}

module.exports = PushSideCartridgeTask;
