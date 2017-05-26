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
            await Mep.Motion.go(new TunedPoint(-870, 80, [ 870, 80, 'blue' ]), { speed: 150, backward: true });
            this.common.terrain.lunar3Available = false;
            await Mep.Motion.go(new TunedPoint(-680, 305, [ 690, 305, 'blue' ]), { speed: 150, backward: true });
            await this.common.push();
            this.common.robot.colorfulModules = 0;
            this.finish();
        } catch (e) {
            Mep.Log.error(TAG, e);
            this.suspend();
        }
    }

    isAvailable() {
        return (lunar.isEmpty() === false);
    }

    plusPriority() {
        return (this.common.robot.colorfulModules > 1) ? -500 : 0;
    }
}

module.exports = PushSideCartridgeTask;
