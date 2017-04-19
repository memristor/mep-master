const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const Delay = Mep.require('misc/Delay');
const Point = Mep.require('misc/Point');
const lunar = Mep.getDriver('LunarCollector');
const Console = require('./Console');

const TAG = 'PushMiddleCartridgeTask';

class PushMiddleCartridgeTask extends Task {
    async onRun() {
        try {
            await Mep.Motion.go(new TunedPoint(10, -200), {speed: 70, backward: true});
            await Mep.Motion.go(new TunedPoint(10, 50), {speed: 70, backward: true});

            await this.common.push();
        } catch (e) {
            Mep.Log.error(TAG, e);
        }

        this.finish();
    }
}

module.exports = PushMiddleCartridgeTask;
