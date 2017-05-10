const Task = Mep.require('strategy/Task');
const Delay = Mep.require('misc/Delay');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');

const TAG = 'SampleTask';

class SampleTask extends Task {
    async onRun() {
        try {
            // Good practices:
            // - get close to destination with high speed and than to reduce speed,
            // - first movement in task start with path finding turned on,
            // - define `obstacle` ([ms] after command will be rejected if obstacle is detected in hazard region)
            await Mep.Motion.go(new TunedPoint(0, 0), { obstacle: 1000, friend: 2000, speed: 200, pf: true });
            await Mep.Motion.go(new TunedPoint(0, 100), { speed: 50 });

            // You have to finish or suspend task
            this.finish();
        } catch (e) {
            // Global error handling for current task. You are not obligated to handle different exceptions
            // however you have to suspend (or finish) task.
            // Optional!
            switch (e.action) {
                case 'stuck':
                    // If robot is stacked wait for some time (stop needs some time) and
                    // than go in opposite direction (opposite to previous one).
                    // Every motion command must be in try/catch block, if not strategy will be stalled
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
}

module.exports = SampleTask;