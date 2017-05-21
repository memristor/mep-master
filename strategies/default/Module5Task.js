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
            await Mep.Motion.go(new TunedPoint(-770, 650, [ 770, 655, 'blue' ]), { speed : 70, radius: 1});
            await lunar.collect();
            await Delay(500);
						lunar.standby().catch(() => {});
            await Mep.Motion.go(new TunedPoint(-1000, 360, [ 1000, 360, 'blue' ]), { radius: 1 ,backward: true, speed: 130 });

            //lunar.standby().catch(() => {});

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
