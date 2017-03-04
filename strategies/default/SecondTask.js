const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const Delay = Mep.require('misc/Delay');

const TAG = 'SecondTask';

class SecondTask extends Task {
    async onRun() {
        try {
            await Mep.Motion.go(new TunedPoint(-900, 300 ), { speed: 100, tolerance: 50 });
            await Mep.Motion.go(new TunedPoint(-600, -300), { speed: 150, tolerance: 50 });
        } catch (e) {
            if (e.action == 'stuck') {
                await Mep.Motion.stop();
                await Delay(1000);
            }
        }
    }
}

module.exports = SecondTask;
