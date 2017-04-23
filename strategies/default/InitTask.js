const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const starter = Mep.getDriver('StarterDriver');
const Delay = Mep.require('misc/Delay');
const Point = Mep.require('misc/Point');
const lunar = Mep.getDriver('LunarCollector');
const Console = require('./Console');
const MotionDriver = Mep.require('drivers/motion/MotionDriver');

const TAG = 'InitTask';

let counter = 0;

class InitTask extends Task {
    async onRun() {
        // Mep.getDriver('FrontLunarDetector').on('changed', (val) => { if (val === 1) console.log('Lunars:', ++counter); });
        // await Delay(200);
        //await this.common.collect();
        // Mep.getDriver('MotionDriver').softStop();
        // Mep.getDriver('ServoLimiter').setPosition(560);
        // await Mep.Motion.straight(-200, { speed: 110 });

        // Mep.getDriver('MotionDriver').setConfig(26, 20, 0);
        // Mep.getDriver('MotionDriver').setConfig(24, 100);

        // await Mep.Motion.go(new TunedPoint(-610, 0), { speed: 150, backward: true, tolerance: 0, radius: 180 });
        //await Mep.Motion.go(new TunedPoint(-610, -790), { speed: 150, backward: false, tolerance: -1 });

        //Mep.getDriver('ColorSensor').start();
        //Mep.getDriver('ColorSensor').on('changed', (color) => { console.log('Color:', color); });

        // Mep.getDriver('ServoCollectorHandRight').setPosition(500);
        //Mep.getDriver('ColorRotator').write(1);
        //Mep.getDriver('CircularEjector').start(100, true);
        // Mep.getDriver('CollectorBigTrack').start(100);
        //Mep.getDriver('ColorServo').setPosition(730); // 600

        // lunar.rotate().catch((e) => { console.log(e); });
        // lunar.openLimiter();

        await starter.waitStartSignal(new Console());

        try {
            await Mep.Motion.go(new TunedPoint(-360, -550), { speed: 90, backward: true, tolerance: 0, radius: 180 });

            // await Mep.Motion.go(new TunedPoint(-350, -350), { speed: 70, backward: true });
        } catch (e) {
            Mep.Log.error(TAG, e);
        }

        this.finish();
    }
}

module.exports = InitTask;
