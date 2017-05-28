const Task = Mep.require('strategy/Task');
const Delay = Mep.require('misc/Delay');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');

// Drivers
const ballPicker = Mep.getDriver('BallPicker');
const directionBall = Mep.getDriver('DirectionBall');


const TAG = 'SmallHoleTask';

class SmallHoleTask extends Task {
    async onRun() {
        try {
            try {
                await Mep.Motion.go(new TunedPoint(-630, -550, [630, -550, 'blue']), {speed: 50, backward: true});
            } catch (e) {}

            try {
                await Mep.Motion.rotate(new TunedAngle(-30, [ -150, 'blue' ]), {speed: 50, backward: true});
            } catch (e) {}

            try { await this.common.pick(); } catch (e) { Mep.Log.error(TAG, e); }
            this.common.robot.ballsLoaded = true;

            await Delay(800);
            try { await Mep.Motion.straight(170); } catch (e) { Mep.Log.error(TAG, e); }

            // Wait for signal message
            while (this.common.leaveBallEnabled === false) { await Delay(300); }

            this.finish();
        } catch (e) {
            switch (e.action) {
                case 'stuck':
                    await Delay(500);
                    try { await Mep.Motion.straight(100, { opposite: true }); } catch (e) { Mep.Log.error(TAG, e); }
                    break;

                case 'friend':
                    // Friend robot is detected and detection timeout is exceeded
                    break;

                case 'obstacle':
                    // Obstacle is detected and detection timeout is exceeded
                    break;
            }

            // You have to finish or suspend task
            this.suspend();
        }
    }

    /*
     _onTick(secondsPassed) {
     console.log('Seconds passed', secondsPassed);
     if (secondsPassed > (Mep.Config.get('duration') - 3) && this._finalTaskExecuted === false) {
     this._finalTaskExecuted = true;
     // this.runTask(this._finalTask);
     // this._finalTaskExecuted = true;
     }
     }
     */

    isAvailable() {
        return (this.common.robot.ballsLoaded === false);
    }
}




module.exports = SmallHoleTask;
