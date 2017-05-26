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
			//await Mep.Motion.go(new TunedPoint(-900, 60, [ 920, 70, 'blue' ]));

			//NOTE: probno
			await Mep.Motion.go(new TunedPoint(-714, 106, [ 920, 70, 'blue' ]), {speed: 210});

			//-764,69
            lunar.prepare().catch(() => {});
			//await Mep.Motion.go(new TunedPoint(-700, 260, [ 735, 250, 'blue' ]));
			//NOTE: probno,namestiti za plavu
			await Mep.Motion.go(new TunedPoint(-1060, 106, [ 735, 250, 'blue' ]), {speed:  70});
			//-951, 55
            lunar.collect();
            lunar.hold();
            await Delay(400);
            await Mep.Motion.go(new TunedPoint(-923, 83, [ 920, 83, 'blue' ]), { backward: true });
            this.common.robot.colorfulModules++;

            this.finish();
		} catch (e) {
			Mep.Log.error(TAG, e);
			this.suspend();
        }
    }

    isAvailable() {
		return (this.common.robot.colorfulModules !== 4 &&
			this.common.robot.monochromeModules !== 4 &&
			this.common.terrain.lunar3Available === true
		);
	}
}
module.exports = Module3Task;
