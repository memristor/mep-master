const Task = Mep.require('types/Task');
const TunedPoint = Mep.require('types/TunedPoint');
const position = Mep.getPositionService();
const starter = Mep.getDriverManager().getDriver('StarterDriver');

class InitTask extends Task {
    async onRun() {
        await starter.waitStartSignal();

        // Let's move around
        await position.set(new TunedPoint(1100, 0), {speed: 130});
        await position.set(new TunedPoint(-1300, 0));

        this.finish();
    }

}

module.exports = InitTask;
