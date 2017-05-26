const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const Delay = Mep.require('misc/Delay');
const Point = Mep.require('misc/Point');
const lunar = Mep.getDriver('LunarCollector');
const Console = require('./Console');
const MotionDriver = Mep.require('drivers/motion/MotionDriver');

const TAG = 'Module5Task';

class Module5Task extends Task {
	async onRun(){
		try {
            lunar.limiterClose();
            lunar.prepare().catch(() => {});
            await Mep.Motion.go(new TunedPoint(-1040, 370, [ 1040, 370, 'blue' ]), { speed : 160 });
            await Mep.Motion.go(new TunedPoint(-770, 690, [ 840, 670, 'blue' ]), { speed : 120 });
            lunar.collect();
            await Delay(1000);
            await Mep.Motion.go(new TunedPoint(-1000, 360, [ 1000, 360, 'blue' ]), { backward: true, speed: 130 });
            lunar.standby().catch(() => {});

            //lunar.standby().catch(() => {});
            Mep.Share.send({ leaveBallEnabled: true });

            this.finish();
        } catch (e) {
            Mep.Log.error(TAG, e);
            this.suspend();
        }
    }

    isAvailable() {
        return (this.common.robot.colorfulModules !== 4 && this.common.robot.monochromeModules !== 4);
    }
}
module.exports = Module5Task;
