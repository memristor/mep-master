const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const Delay = Mep.require('misc/Delay');

const TAG = 'FirstTask';

class FirstTask extends Task {
    async onRun() {
        try {
            await Mep.Motion.go(new TunedPoint(-310, 0 ), { speed: 70, tolerance:  -1});
            //await Mep.Motion.go(new TunedPoint(-450, 50 ), { speed: 70, tolerance:  -1});
            
            //await Mep.Motion.rotate(new TunedAngle(180));
        } catch (e) {
            console.log(e);
            if (e.action == 'stuck') {
                await Mep.Motion.stop();
                await Delay(1000);
                await Mep.Motion.straight(-100);
            } else if (e.action == 'pathfindinf') {

            } else {
                this.finish();
            }
        }
    }
}
module.exports = FirstTask;
