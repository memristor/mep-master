const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const starter = Mep.getDriver('StarterDriver');
const Delay = Mep.require('misc/Delay');
const Point = Mep.require('misc/Point');
const lunar = Mep.getDriver('LunarCollector');
const Console = require('./Console');
const MotionDriver = Mep.require('drivers/motion/MotionDriver');

const TAG = 'Module2Task';

class Module2Task extends Task {
	async onRun(){
		try {
			await Mep.Motion.go(new TunedPoint(-808, 65, [ 808, 65, 'blue' ]), { speed: 190 });
			lunar.limiterClose();
			lunar.prepare();
			await Mep.Motion.straight(80, { speed: 90 });
            lunar.collect();
            await Delay(1500);
            lunar.standby().catch(() => {});
			this.common.robot.colorfulModules++;
			this.common.asyncRotateOnColor();
            this.finish();
		} catch (e) {
			Mep.Log.error(TAG, e);
            this.suspend();
        }
    }
}

module.exports = Module2Task;
