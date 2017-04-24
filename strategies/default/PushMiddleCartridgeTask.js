const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const Delay = Mep.require('misc/Delay');
const Point = Mep.require('misc/Point');
const lunar = Mep.getDriver('LunarCollector');

const TAG = 'PushMiddleCartridgeTask';

class PushMiddleCartridgeTask extends Task {
    async onRun() {
        try {
            await Mep.Motion.go(
                new TunedPoint(5, -200, [ 25, -200, 'blue' ]),
                { speed: 110, backward: true/*, tolerance: 150, radius: 150 */});
            }
            catch (e) {
                Mep.Log.error(TAG, e);
            }
        try {
            await Mep.Motion.go(
                new TunedPoint(10, 30, [ 25, 30, 'blue' ]),
                { speed: 90, backward: true/*, tolerance: 0, radius: 30*/ });
            // await Mep.Motion.rotate(new TunedAngle(-90));
        }
        catch (e) {
            Mep.Log.error(TAG, e);
        }
        try{
          await Mep.Motion.go(
              new TunedPoint(10, 37/*, [ , , 'blue' ]*/),
              { speed: 90, backward: true/*, tolerance: 0, radius: 30*/ });
        }
        catch (e) {
            Mep.Log.error(TAG, e);
        }
            // await Mep.Motion.go(new TunedPoint(10, -200), {speed: 70, backward: true});
            // await Mep.Motion.go(new TunedPoint(10, 50), {speed: 70, backward: true});
        try {
            await this.common.push();
        } catch (e) {
            Mep.Log.error(TAG, e);
            this.suspend();
            return;
        }
        this.finish();
    }
}

module.exports = PushMiddleCartridgeTask;
