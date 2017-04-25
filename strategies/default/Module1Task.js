const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const starter = Mep.getDriver('StarterDriver');
const Delay = Mep.require('misc/Delay');
const Point = Mep.require('misc/Point');
const lunar = Mep.getDriver('LunarCollector');
const Console = require('./Console');
const MotionDriver = Mep.require('drivers/motion/MotionDriver');

const TAG = 'Module1Task'

class Module1Task extends Task {
	async onRun(){
		try {
				lunar.prepare();		
				await Mep.Motion.go(new TunedPoint(-510, -410));
				lunar.collect();
				lunar.limiterClose();
				await Mep.Motion.go(new TunedPoint(-700, -100));
				lunar.standby();
			} catch (e) {
            Mep.Log.error(TAG, e);
        }
    this.finish();
    }
}

module.exports = Module1Task;