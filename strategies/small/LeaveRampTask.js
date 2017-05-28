const Task = Mep.require('strategy/Task');
const Delay = Mep.require('misc/Delay');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');

// Drivers
const ballPicker = Mep.getDriver('BallPicker');
const directionBall = Mep.getDriver('DirectionBall');


const TAG = 'LeaveRampTask';

class LeaveRampTask extends Task {
    async onRun() {
        // Wait for signal message
        while (this.common.leaveStartEnabled === false) { await Delay(300); }

        ballPicker.setPosition(190);
        await Delay(200);

        for (let i = 0; i < 10; i++) {
            try {
				// start position for yellow -1200, -790
				// go forward +700 from starting pos
                await Mep.Motion.go(new TunedPoint(-450, -790, [450, -790, 'blue']), { speed: 100 });
            } catch (e) {

            }
        }
        ballPicker.setPosition(445);
        this.common.lowerDirBall();

        this.finish();
    }
}

module.exports = LeaveRampTask;
