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
            await position.set(new TunedPoint(770, -800), { speed: 130, pathfinding: true });
            await position.set(new TunedPoint(-750, -850), { pathfinding: true });
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
