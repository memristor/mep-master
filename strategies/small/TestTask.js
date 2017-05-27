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
			// directionBall.setPosition(170);
			await starter.waitStartSignal(new Console());
			await this.common.colorRotate();
			await Mep.Motion.straight(90);
			await this.common.colorRotate();
			await Mep.Motion.straight(90);
			await this.common.colorRotate();
			await Mep.Motion.straight(90);
			await this.common.colorRotate();
			await Mep.Motion.straight(90);
			await this.common.colorRotate();
			await Mep.Motion.straight(90);
			
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
