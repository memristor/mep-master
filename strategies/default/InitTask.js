const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const position = Mep.getPositionService();
const starter = Mep.getDriverManager().getDriver('StarterDriver');
const motionDriver = Mep.DriverManager.getDriver('MotionDriver');

const TAG = 'InitTask';

class InitTask extends Task {
    async onRun() {
        await starter.waitStartSignal();

        // Let's move around
        try {
            let config = { speed: 80, tolerance: 150 };

            await position.set(new TunedPoint(-1000, 400), config);
            await position.set(new TunedPoint(-1200, 0), config);
            await position.set(new TunedPoint(79, -6), config);
            await position.set(new TunedPoint(500, 100), config);
            config.speed += 20;
            await position.set(new TunedPoint(-1100, 0), config);

            //config.tolerance = -1;
            await position.set(new TunedPoint(-1300, 0), config);
            await position.rotate(new TunedAngle(0));

        } catch (e) {
            Mep.Log.error(TAG, e);
            await this.onErrorForwardBack(e);
        }

        this.finish();
    }

    async onErrorForwardBack(taskError) {
        await position.straight(-100);
        this.finish();
    }
}

module.exports = InitTask;
