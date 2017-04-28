const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const Delay = Mep.require('misc/Delay');
const Point = Mep.require('misc/Point');
const lunar = Mep.getDriver('LunarCollector');
const Console = require('./Console');
const MotionDriver = Mep.require('drivers/motion/MotionDriver');

const TAG = 'Module1Task';

class Module1Task extends Task {
	async onRun(){
		try {
            lunar.limiterClose();
			lunar.prepare();
			await Mep.Motion.go(new TunedPoint(-510, -410, [ 510, -410, 'blue' ]));
			lunar.collect();
			lunar.limiterClose();
			await Mep.Motion.go(new TunedPoint(-700, -100, [ 700, -100, 'blue' ]));

            lunar.standby().catch(() => {});

            this.finish();
		} catch (e) {
			Mep.Log.error(TAG, e);
            this.suspend();
        }
    }
}

module.exports = Module1Task;