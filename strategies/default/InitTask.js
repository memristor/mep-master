const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const starter = Mep.getDriver('StarterDriver');
const Delay = Mep.require('misc/Delay');

const TAG = 'InitTask';

class InitTask extends Task {
    // Simplified functions for prompt
    go(x, y, config) {
        Mep.Motion.go(new TunedPoint(x, y), config);
    }

    async rotate(angle, config) {
        await Mep.Motion.rotate(new TunedAngle(angle), config);
        console.log('Finished rotation');
    }

    straight(val) {
        Mep.Motion.straight(val);
    }

    async home() {
        await Mep.Motion.go(new TunedPoint(-1000, 0), { pf: true, tolerance: -1, speed: 100, backward: true });
        await Delay(200);
        await Mep.Motion.rotate(new TunedAngle(0));
        console.log('Arrived to home');
    }

    get m() {
        return Mep.getDriver('MotionDriver');
    }

    async onRun() {
        await starter.waitStartSignal(this);

        try {
            await Mep.Motion.go(new TunedPoint(0, 0), { speed: 120, tolerance:  -1, pf: true, rerouting: false });

            await this.home();
        } catch (e) {
            Mep.Log.error(TAG, e);
        }

        this.finish();
    }
}

module.exports = InitTask;
