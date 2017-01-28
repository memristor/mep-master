const Task = Mep.require('types/Task');
const TunedPoint = Mep.require('types/TunedPoint');
const position = Mep.getPositionService();
const starter = Mep.getDriverManager().getDriver('StarterDriver');
const motionDriver = Mep.DriverManager.getDriver('MotionDriver');

const TAG = 'InitTask';

class InitTask extends Task {
    async onRun() {
        await starter.waitStartSignal();

        // Let's move around
        try {
            let config = { speed: 100, tolerance: 150 };

            await position.set(new TunedPoint(-1000, -600), config);
            await position.set(new TunedPoint(-200, 530), config);
            await position.set(new TunedPoint(79, -6), config);
            await position.set(new TunedPoint(800, -300), config);
            await position.set(new TunedPoint(-400, -575), config);
        } catch (e) {
            this.onErrorForwardBack(e);
        }

        this.finish();
    }

    onErrorForwardBack(taskError) {
        Mep.Log.error(TAG, taskError);
    }
}

module.exports = InitTask;
