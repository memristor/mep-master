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
            await Mep.Motion.go(new TunedPoint(-1200, -125), { speed: 70, backward: true });

            await Mep.Motion.rotate(new TunedAngle(90));
            await lunar.ejectSide();
            await Delay(1000);

            lunar.startTrack();
            await Mep.Motion.go(new TunedPoint(-1200, 10), { speed: 70, backward: false });
              await Delay(100);
            lunar.stopTrack();
            await lunar.ejectSide();
            await Delay(1000);
/*
            lunar.startTrack();
            await Mep.Motion.go(new TunedPoint(-1200, 130), { speed: 70, backward: false });
              await Delay(100);
            lunar.stopTrack();
            await lunar.ejectSide();
            await Delay(1000);

            try{ await lunar.collect();}
            catch(e) { }
            Delay(2000);
            lunar.startTrack();
            await Mep.Motion.go(new TunedPoint(-1200, 155), { speed: 70, backward: false });
            await Delay(100);
            lunar.stopTrack();
            await lunar.ejectSide();
*/
        } catch (e) {
            Mep.Log.error(TAG, e);
        }
        this.finish();
    }
}

module.exports = CollectStartRocketTask;
