const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const Delay = Mep.require('misc/Delay');
const Point = Mep.require('misc/Point');
const lunar = Mep.getDriver('LunarCollector');
const Console = require('./Console');

const TAG = 'EjectStartCartridgeTask';

class EjectStartCartridgeTask extends Task {
    /**
     * @override
     */
    async onRun() {
        // Define points
        //let points = [ new TunedPoint(-1200, 0), new TunedPoint(-1200, 115), new TunedPoint(-1200, 230)];
        let points = [ new TunedPoint(-1200, 70) ];


        try {
            // Go to position
            await Mep.Motion.go(new TunedPoint(-1110, 80), { backward: true });
            await Mep.Motion.go(new TunedPoint(-1190, -90), { speed: 70, backward: true });
            await Mep.Motion.rotate(new TunedAngle(90));

            // Eject first lunar module
            try { await lunar.rotate(); } catch (e) { }
            await lunar.lunarTake();
            await lunar.lunarEject();

            // Eject other lunar modules
            lunar.trackStart();
            for (let i = 0; i < points.length; i++) {
                // Move to ejection location
                await Mep.Motion.go( points[i], {speed: 70, backward: false });

                // Wait for module and if there is no module break
                let moduleFound = false;
                for (let i = 0; i < 15; i++) {
                    await Delay(100);
                    if (lunar.isLastInside() === true) {
                        moduleFound = true;
                        break;
                    }
                }
                if (moduleFound === false) {
                    break;
                }

                // Rotate
                await Delay(200);
                try { await lunar.rotate(); } catch (e) { }

                // Eject
                await lunar.lunarTake();
                lunar.collect().catch(() => {});
                await lunar.lunarEject();
            }

            lunar.standby();

            // Go away from edge
            await Mep.Motion.go(new TunedPoint(-1000, -100), { speed: 70, backward: true, radius: 300, tolerance: 100 });


            this.finish();
        } catch (e) {
            Mep.Log.error(TAG, e);
            this.suspend();
        }
    }
}

module.exports = EjectStartCartridgeTask;