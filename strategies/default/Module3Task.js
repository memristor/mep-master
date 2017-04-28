const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const starter = Mep.getDriver('StarterDriver');
const Delay = Mep.require('misc/Delay');
const Point = Mep.require('misc/Point');
const lunar = Mep.getDriver('LunarCollector');
const Console = require('./Console');
const MotionDriver = Mep.require('drivers/motion/MotionDriver');

const TAG = 'Module3Task';

class Module3Task extends Task {
	async onRun(){
		try {
			lunar.limiterClose();
			await Mep.Motion.go(new TunedPoint(-900, 60, [ 920, 70, 'blue' ]));
            lunar.prepare().catch(() => {});
			await Mep.Motion.go(new TunedPoint(-700, 260, [ 735, 250, 'blue' ]));
            try { await lunar.collect(); } catch (e) {}
            await Mep.Motion.go(new TunedPoint(-923, 83, [ 920, 83, 'blue' ]), { backward: true });

            // lunar.standby().catch(() => {});
            this.common.robot.colorfulModules++;

            this.finish();
		} catch (e) {
			Mep.Log.error(TAG, e);
			this.suspend();
        }
    }
}
module.exports = Module3Task;
