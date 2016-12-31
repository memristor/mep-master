const Task = Mep.require('types/Task');
const TunedPoint = Mep.require('types/TunedPoint');
const position = Mep.getPositionService();

class SecondTask extends Task {
    async onRun() {
        await position.set(new TunedPoint(0, -800), {speed: 70});
        await position.set(new TunedPoint(0, 800));
    }

}

module.exports = SecondTask;
