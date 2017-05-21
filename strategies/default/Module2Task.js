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
      //lunar.limiterClose();
			//lunar.prepare();
			/*
			MotionDriver.on('positionChanged', (name, pos) => {
				if(pos.getDistance(new Point(-890, 50)) < 200) {
					this.removeListener('positionChanged');
					lunar.limiterClose();
					lunar.collect();
				}
			});
			*/
			//await Mep.Motion.go(new TunedPoint(-890, 50, [ 900, 73, 'blue' ]), {speed: 255, radius: 1});
//NOTE: napisati za zutu, dodat tolerance da bi produzio dalje manjom brzinom
			await Mep.Motion.go(new TunedPoint(-890, 50, [ 808, 65, 'blue' ]), {speed: 255, radius: 1, /*tolerance: 40*/ });
			lunar.limiterClose();
			await Mep.Motion.straight(60);
			await lunar.collect();
			await Delay(500);
			//await Mep.Motion.straight(-30);	//NOTE: bilo -50
            lunar.standby().catch(() => {});

            this.finish();
		} catch (e) {
			Mep.Log.error(TAG, e);
            this.suspend();
        }
    }
}

module.exports = Module2Task;
