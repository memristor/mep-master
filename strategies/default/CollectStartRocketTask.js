const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const Delay = Mep.require('misc/Delay');
const Point = Mep.require('misc/Point');
const lunar = Mep.getDriver('LunarCollector');
const Console = require('./Console');

const TAG = 'CollectStartRocketTask';

class CollectStartRocketTask extends Task {
    async onRun() {
      try {
        //NOTE: prvo kretanje koje je bilo u Init tasku
          await Mep.Motion.go(new TunedPoint(-360, -550, [ 365, -550, 'blue' ]),
              { speed: 255, backward: true, tolerance: 0, radius: 180 });
              // await Mep.Motion.go(new TunedPoint(-350, -350), { speed: 70, backward: true });
          } catch (e) {
              Mep.Log.error(TAG, e);
          }
        try {

            lunar.prepare();
            await Mep.Motion.go(
                new TunedPoint(-355, -737, [ 355, -737, 'blue' ]),
                { speed: 130, backward: false });

            this.common.robot.monochromeModules = 4;
            await this.common.collect2();
            //lunar.trackStop();
            await Mep.Motion.straight(-100, { speed: 150 });

            this.finish();
        } catch (e) {
            Mep.Log.error(TAG, e);
            this.suspend();
        }
    }

    isAvailable() {
        return (lunar.isEmpty() === true);
    }
}

module.exports = CollectStartRocketTask;
