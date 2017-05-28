const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const Delay = Mep.require('misc/Delay');
const Console = require('./Console');
const MotionDriver = Mep.require('drivers/motion/MotionDriver');

// Drivers
const starter = Mep.getDriver('StarterDriver');
const ballPicker = Mep.getDriver('BallPicker');
const directionBall = Mep.getDriver('DirectionBall');


const TAG = 'TestTask';

class TestTask extends Task {
    async onRun() {
		this.common.lowerDirBall();
		try {
		    let r;

			// directionBall.setPosition(170);
			await Delay(500);

            r=1; while(r) { try { await Mep.Motion.go(new TunedPoint(400, -415, [-400, -415, 'blue']), {speed: 100}); r=0;} catch(e) {}}
            r=1; while(r) { try { await Mep.Motion.go(new TunedPoint(810, -80, [-810, -80, 'blue']), { speed: 100 }); r=0;} catch(e) {}}
            r=1; while(r) { try { await Mep.Motion.go(new TunedPoint(1160, -180, [-1160, -180, 'blue']), { speed: 100 }); r=0;} catch(e) {}}


            // try{ await Mep.Motion.go(new TunedPoint(1250, 240, [-1250, 240, 'blue']), { speed: 90, pf: true }); } catch(e){ }
            try { await Mep.Motion.rotate(new TunedAngle(-90, [ 90, 'blue' ])) } catch (e) {}


            await this.common.colorRotate();
			await Mep.Motion.straight(-90);

			await this.common.colorRotate();
			await Mep.Motion.straight(-90);
			await this.common.colorRotate();
			await Mep.Motion.straight(-90);
			await this.common.colorRotate();
			await Mep.Motion.straight(-90);
			await this.common.colorRotate();
			await Mep.Motion.straight(-90);

			this.finish();
		} catch(e) {
			Mep.Log.error(TAG, e);
		}
		try {
			await this.common.colorUp();
		} catch(e) {
			Mep.Log.error(TAG, e);
		}
    }
}

module.exports = TestTask;
