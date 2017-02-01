const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');

class SecondTask extends Task {
    async onRun() {
        //await position.set(new TunedPoint(0, -800));
        //await position.set(new TunedPoint(0, 800));
    }
}

module.exports = SecondTask;
