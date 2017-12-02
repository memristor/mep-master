const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const Delay = Mep.require('misc/Delay');
const lunar = Mep.getDriver('LunarCollector');
const MotionDriver = Mep.require('drivers/motion/MotionDriver');

const TAG = 'Module4Task';

class Module4Task extends Task {
	async onRun(){
		try {
			lunar.limiterClose();
			lunar.trackStart();	// Da bi dosao do kraja onaj koji je tek pokupljen

            lunar.prepare().catch(() => {});
            // await Mep.Motion.go(new TunedPoint(-1020, -100, [ 1020, -100, 'blue' ]), { speed: 120 });
            await Mep.Motion.go(new TunedPoint(-1155, -250, [ 1160, -270, 'blue' ]), { speed: 120 });
            Mep.Share.send({ leaveBallEnabled: true });
            lunar.collect();
            await Delay(1000);
			await Mep.Motion.straight(-100);

            lunar.standby().catch(() => {});

            this.finish();
		} catch (e) {
            Mep.Log.error(TAG, e);
            this.suspend();
        }
    }

    isAvailable() {
        return (this.common.robot.colorfulModules !== 4 && this.common.robot.monochromeModules !== 4);
    }

    plusPriority() {
       return (this.scheduler.getPreviousTask() == 'Module5Task') ? 300 : 0;
    }
}
module.exports = Module4Task;
