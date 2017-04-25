const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const starter = Mep.getDriver('StarterDriver');
const Delay = Mep.require('misc/Delay');
const Point = Mep.require('misc/Point');
const lunar = Mep.getDriver('LunarCollector');
const Console = require('./Console');
const MotionDriver = Mep.require('drivers/motion/MotionDriver');

const TAG = 'Module3Task'

class Module3Task extends Task {
	async onRun(){
		try {
				lunar.limiterClose();
				await Mep.Motion.go(new TunedPoint(-923, 77), {tolerance: 0}); // DODAT (direktor racunao)	
				//await Mep.Motion.go(new TunedPoint(-820, 250), {tolerance: 0});
				lunar.prepare(600, 400);
				await Mep.Motion.go(new TunedPoint(-760, 255), {tolerance: 0});
				await Mep.Motion.rotate(new TunedAngle());
				await lunar.collect();
				await Delay(1500);
				await Mep.Motion.straight(-50);
			} catch (e) {
            Mep.Log.error(TAG, e);
        }
    this.finish();
    }
}
module.exports = Module3Task;
