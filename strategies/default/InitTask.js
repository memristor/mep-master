const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const starter = Mep.getDriverManager().getDriver('StarterDriver');

const TAG = 'InitTask';

class InitTask extends Task {
    async onRun() {
        await starter.waitStartSignal();

        // Let's move around
        try {
            let config = { speed: 80, tolerance: 150 };

            await Mep.Motion.go(new TunedPoint(-1000, 400), config);
            await Mep.Motion.go(new TunedPoint(-1200, 0), config);
            await Mep.Motion.go(new TunedPoint(79, -6), config);
            await Mep.Motion.go(new TunedPoint(500, 100), config);
            config.speed += 20;
            await Mep.Motion.go(new TunedPoint(-1100, 0), config);

            //config.tolerance = -1;
            await Mep.Motion.go(new TunedPoint(-1300, 0), config);
            await Mep.Motion.go(new TunedAngle(0));

        } catch (e) {
            Mep.Log.error(TAG, e);
            await this.onErrorForwardBack(e);
        }

        this.finish();
    }

    async onErrorForwardBack(taskError) {
        await Mep.Motion.straight(Mep.Motion.getDirection() * (-100));
        this.finish();
    }
}

module.exports = InitTask;
