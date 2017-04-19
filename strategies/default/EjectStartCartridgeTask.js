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
            await Mep.Motion.go(new TunedPoint(-1200, -120), { speed: 70, backward: true });

            await Mep.Motion.rotate(new TunedAngle(90));
            await lunar.ejectSide();
            await Delay(1000);

            lunar.startTrack();
            await Mep.Motion.go(new TunedPoint(-1200, 0), { speed: 70, backward: false });
            lunar.stopTrack();
            await lunar.ejectSide();
            await Delay(1000);

            lunar.startTrack();
            await Mep.Motion.go(new TunedPoint(-1200, 120), { speed: 70, backward: false });
            lunar.stopTrack();
            await lunar.ejectSide();
        } catch (e) {
            Mep.Log.error(TAG, e);
        }

        this.finish();
    }
}

module.exports = CollectStartRocketTask;
