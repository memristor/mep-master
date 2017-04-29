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
        this.common.robot.monochromeModules = 0;
        try {
            await Mep.Motion.go(new TunedPoint(-870, 80, [ 870, 80, 'blue' ]), { backward: true });
            this.common.terrain.lunar3Available = false;
            await Mep.Motion.go(new TunedPoint(-660, 310, [ 670, 300, 'blue' ]), { speed: 70, backward: true });
            await this.common.push();

            this.finish();
        } catch (e) {
            Mep.Log.error(TAG, e);
            this.suspend();
        }
    }

    isAvailable() {
        return (lunar.isEmpty() === false && this.common.robot.colorfulModules <= 1);
    }
}

module.exports = PushSideCartridgeTask;
