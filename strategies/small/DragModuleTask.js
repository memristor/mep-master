const Task = Mep.require('strategy/Task');
const Delay = Mep.require('misc/Delay');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');

// Drivers
const ballPicker = Mep.getDriver('BallPicker');
const directionBall = Mep.getDriver('DirectionBall');


const TAG = 'DragModuleTask';

class DragModuleTask extends Task {
    async onRun() {
        try {
            while (this.common.leaveBallEnabled === false) { await Delay(300); }

            await Mep.Motion.go(new TunedPoint(-260, -706, [260, -706, 'blue']),{backward: false});
            await Mep.Motion.go(new TunedPoint(-244, -168, [244, -168, 'blue']),{backward: false});
            await Mep.Motion.go(new TunedPoint(-515, -210, [515, -210, 'blue']),{backward: false});
            await Mep.Motion.go(new TunedPoint(-533, -692, [533, -692, 'blue']),{backward: false});
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

}

module.exports = DragModuleTask;