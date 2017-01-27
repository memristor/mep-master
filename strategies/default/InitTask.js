const Task = Mep.require('types/Task');
const TunedPoint = Mep.require('types/TunedPoint');
const position = Mep.getPositionService();
const starter = Mep.getDriverManager().getDriver('StarterDriver');

const TAG = 'InitTask';

class InitTask extends Task {
    async onRun() {
        await starter.waitStartSignal();

        // Let's move around
        try {
            let speed = 150;
            await position.set(new TunedPoint(-1000, 0), { speed: speed, tolerance: 100 });
            await position.set(new TunedPoint(-750, -850), { speed: speed, tolerance: 100 });
            await position.set(new TunedPoint(-1000, 0), { speed: speed, tolerance: 100 });
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
