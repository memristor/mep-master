const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');

const TAG = 'SecondTask';

class SecondTask extends Task {
    async onRun() {
        //Mep.Log.info(TAG, 'Started execution');
        //await Mep.Motion.go(new TunedPoint(-1300, 0));

        //Mep.Motion.stop(true);
        //this.finish();
        //await position.set(new TunedPoint(0, -800));
        //await position.set(new TunedPoint(0, 800));
    }
}

module.exports = SecondTask;
