const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const Delay = Mep.require('misc/Delay');
const lunar = Mep.getDriver('LunarCollector');
const Console = require('./Console');

const servoPump = Mep.getDriver('ServoPump');
const cylinder = Mep.getDriver('Cylinder');

const TAG = 'PushSideCartridgeTask';

class PushSideCartridgeTask extends Task {
    async onRun() {
        this.common.robot.monochromeModules = 0;

        try {
            await Mep.Motion.go(new TunedPoint(-870, 80, [ 870, 80, 'blue' ]), { speed: 150, backward: true });
            this.common.terrain.lunar3Available = false;

            // Kick module
            /*
            await Mep.Motion.rotate(new TunedAngle(-140));
            await Mep.Motion.go(new TunedPoint(-726, 229, [ 870, 80, 'blue' ]), { speed: 150, backward: true });
            servoPump.setPosition(830);
            cylinder.write(1);
            await Delay(600);
            await Mep.Motion.rotate(new TunedAngle(-20));
            servoPump.setPosition(200);
            cylinder.write(0);
            await Delay(600);
            */



            await Mep.Motion.go(new TunedPoint(-673, 312, [ 683, 312, 'blue' ]), { speed: 150, backward: true });
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
