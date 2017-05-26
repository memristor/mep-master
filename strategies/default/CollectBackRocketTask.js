const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const Delay = Mep.require('misc/Delay');
const Point = Mep.require('misc/Point');
const lunar = Mep.getDriver('LunarCollector');
const Console = require('./Console');

const TAG = 'CollectBackRocketTask';

class CollectBackRocketTask extends Task {
    async onRun() {
        try {
            await Mep.Motion.go(new TunedPoint(-1100, 370, [ 1100, 340, 'blue' ]), { speed: 200, backward: false, tolerance: -1 });
            await Mep.Motion.go(new TunedPoint(-1230, 370, [ 1245, 340, 'blue' ]), { speed: 80, backward: false, tolerance: -1 });
            await this.common.collect2();
            this.common.robot.colorfulModules = 2;
            lunar.collect();
            await Mep.Motion.straight(-90);
            await Delay(400);
            lunar.prepare().catch(() => {});

            this.finish();
        } catch (e) {
            switch (e.action) {
                case 'stuck':
                    await Delay(500);
                    try { await Mep.Motion.straight(200, { opposite: true }); } catch (e) { Mep.Log.error(TAG, e); }
                    break;
            }
            Mep.Log.error(TAG, e);
            this.suspend();
        }
    }

    isAvailable() {
        return (lunar.isEmpty() === true);
    }
}

module.exports = CollectBackRocketTask;
