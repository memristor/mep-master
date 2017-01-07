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
            await position.set(new TunedPoint(1100, 0), {speed: 130});
            await position.set(new TunedPoint(-1300, 0));
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
