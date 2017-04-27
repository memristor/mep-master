const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const Delay = Mep.require('misc/Delay');
const Point = Mep.require('misc/Point');
const lunar = Mep.getDriver('LunarCollector');
const Console = require('./Console');
const MotionDriver = Mep.require('drivers/motion/MotionDriver');

const TAG = 'Module4Task';

class Module4Task extends Task {
	async onRun(){
		try {
			lunar.limiterClose();
			await Mep.Motion.go(new TunedPoint(-1161, -210));
			await lunar.prepare();
			await Mep.Motion.straight(20);
			await lunar.collect();
            await Delay(500);
			await Mep.Motion.straight(-100);

            lunar.standby().catch(() => {});

            this.finish();
		} catch (e) {
            Mep.Log.error(TAG, e);
            this.suspend();
        }

    }
}
module.exports = Module4Task;
