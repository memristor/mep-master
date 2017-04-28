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
            lunar.limiterClose();
			lunar.prepare();
			await Mep.Motion.go(new TunedPoint(-890, 50, [ 810, 50, 'blue' ]));
			lunar.limiterClose();
			await Mep.Motion.straight(40);
			await lunar.collect();
			await Delay(700);
			await Mep.Motion.straight(-50);

            lunar.standby().catch(() => {});

            this.finish();
		} catch (e) {
			Mep.Log.error(TAG, e);
            this.suspend();
        }
    }
}

module.exports = Module2Task;