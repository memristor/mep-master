const Task = Mep.require('strategy/Task');
const Delay = Mep.require('misc/Delay');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');

// Drivers
const ballPicker = Mep.getDriver('BallPicker');

const TAG = 'SmallHoleTask';

class SmallHoleTask extends Task {
    async onRun() {
        try {
            await Mep.Motion.go(new TunedPoint(-450, -450, [450, -450, 'blue']), { obstacle: 1000, friend: 2000, speed: 100, pf: true });
            await Mep.Motion.go(new TunedPoint(-650, -450, [650, -450, 'blue']), { speed: 50 });

            await this.common.pick();
            this.common.robot.ballsLoaded = true;

            this.finish();
        } catch (e) {
            switch (e.action) {
                case 'stuck':
                    await Delay(500);
                    try { await Mep.Motion.straight(200, { opposite: true }); } catch (e) { Mep.Log.error(TAG, e); }
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

    isAvailable() {
        return (this.common.robot.ballsLoaded === false);
    }
}

module.exports = SmallHoleTask;