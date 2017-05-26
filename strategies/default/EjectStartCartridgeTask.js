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
        let points = [
            new TunedPoint(-1200, 80, [ 1200, -200, 'blue' ]),
            new TunedPoint(-1200, 200, [ 1200, -350, 'blue']) ];


        try {
            // Go to position
            lunar.trackStart();
            await Mep.Motion.go(new TunedPoint(-1110, 80, [ 1100, 80, 'blue' ]),
                { backward: (Mep.isOppositeSide() ? false : true) });
            await Mep.Motion.go(new TunedPoint(-1190, -90, [ 1200, -90, 'blue' ]),
                { speed: 70, backward: (Mep.isOppositeSide() ? false : true) });
            await Mep.Motion.rotate(new TunedAngle(90, [ -90, 'blue' ]));

            // Eject first lunar module
            try { await lunar.rotate(); } catch (e) { }
            await lunar.lunarTake();
            await lunar.lunarEject();

            // Eject other lunar modules
            lunar.trackStart();
            for (let i = 0; i < points.length; i++) {
                // Move to ejection location
                await Mep.Motion.go(points[i], { speed: 70, backward: false });

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
                lunar.collect();
                await lunar.lunarEject();
                await Delay(250);
            }

            this.common.robot.colorfulModules = 1;
            lunar.standby();

            // Go away from edge
            await Mep.Motion.go(new TunedPoint(-1000, -100, [ 1000, 100, 'blue' ]),
                { speed: 70, backward: true, radius: 300, tolerance: 100 });


            this.finish();
        } catch (e) {
            Mep.Log.error(TAG, e);
            Mep.getDriver('MotionDriver').finishCommand();
            Mep.Motion.straight(100);
            this.suspend();
        }
    }

    isAvailable() {
        return (this.common.robot.monochromeModules <= 0);
    }

    plusPriority() {
        return 0;
    }
}

module.exports = EjectStartCartridgeTask;
