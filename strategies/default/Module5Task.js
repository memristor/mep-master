const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const Delay = Mep.require('misc/Delay');
const Point = Mep.require('misc/Point');
const lunar = Mep.getDriver('LunarCollector');
const Console = require('./Console');
const MotionDriver = Mep.require('drivers/motion/MotionDriver');
const cylinder = Mep.getDriver('Cylinder');
const servoPump = Mep.getDriver('ServoPump');

const TAG = 'Module5Task';

class Module5Task extends Task {
	async onRun(){
		try {
            lunar.limiterClose();
            lunar.prepare().catch(() => {});

            await Mep.Motion.go(new TunedPoint(-1040, 370, [ 1040, 370, 'blue' ]), { speed : 160 });

            // Kick
            /*
            cylinder.write(1);
            servoPump.setPosition(830);
            await Mep.Motion.go(new TunedPoint(-948, 418, [ 1040, 370, 'blue' ]), { speed : 160, backward: true });
            await Mep.Motion.rotate(new TunedAngle(-135));
            await Mep.Motion.straight(-200, { speed: 200 });
            */

            await Mep.Motion.go(new TunedPoint(-770, 690, [ 840, 670, 'blue' ]), { speed : 120 });
            lunar.collect();
            await Delay(1000);
            await Mep.Motion.go(new TunedPoint(-1000, 360, [ 1000, 360, 'blue' ]), { backward: true, speed: 130 });
            lunar.standby().catch(() => {});

            // Kick
            /*
            cylinder.write(0);
            servoPump.setPosition(200);
            */


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
