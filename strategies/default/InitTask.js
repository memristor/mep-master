const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const starter = Mep.getDriver('StarterDriver');
const Delay = Mep.require('misc/Delay');
const Point = Mep.require('misc/Point');
const lunar = Mep.getDriver('LunarCollector');


const TAG = 'InitTask';

class InitTask extends Task {
    constructor(scheduler, params) {
        super(scheduler, params);
    }

    // Simplified functions for prompt
    async go(x, y, config) {
        await Mep.Motion.go(new TunedPoint(x, y), config);
    }

    async rotate(angle, config) {
        await Mep.Motion.rotate(new TunedAngle(angle), config);
        console.log('Finished rotation');
    }

    straight(val) {
        Mep.Motion.straight(val);
    }

    async home() {
        await Mep.Motion.go(new TunedPoint(-1300, 0), { pf: true, tolerance: -1, speed: 100, backward: true });
        await Delay(200);
        await Mep.Motion.rotate(new TunedAngle(0));
        console.log('Arrived to home');
    }

    get m() {
        return Mep.getDriver('MotionDriver');
    }

    c(a, b) {
        Mep.getDriver('MotionDriver').setConfig(a, b);
    }

    r(a) {
        Mep.getDriver('MotionDriver').getConfig(a);
    }

    async test() {
        //Mep.getDriver('MotionDriver').reset();
        //Mep.getDriver('MotionDriver').setRefreshInterval(50);

        this.c(9, 332); // 329.5
        this.c(10, 90); // 92.6
        this.c(11, 92.6); // 92.6

        for (let i = 0; i < 0; i++) {
            Mep.getDriver('MotionDriver').setSpeed(70);
            await Mep.getDriver('MotionDriver').moveToPosition(new Point(0, -500));

            await Mep.getDriver('MotionDriver').moveToPosition(new Point(-1000, -500));
            await Mep.getDriver('MotionDriver').moveToPosition(new Point(-1000, 0));
            await Mep.getDriver('MotionDriver').moveToPosition(new Point(0, 0));
        }
    }

    async onRun() {
        //this.test();
        //Mep.getDriver('MotionDriver').softStop();

        //Mep.getDriver('ServoCollectorHandRight').setPosition(500);

        await starter.waitStartSignal(this);

        await Mep.Motion.go(new TunedPoint(-350, -350), { speed: 70, backward: true });
        await Mep.Motion.go(new TunedPoint(-350, -750), { speed: 70, backward: false });

        try {
            lunar.closeLimiter();
            for (let i = 0; i < 3; i++) {
                try { await lunar.collect(); } catch (e) {}
                await Mep.Motion.straight(-40);
                await Delay(1300);
                lunar.prepare();
                await Mep.Motion.straight(40);
            }
            try { await lunar.collect(); } catch (e) {}
            lunar.hold();

            await lunar.stopTrack();
            await Mep.Motion.straight(-100);
            await Mep.Motion.go(new TunedPoint(0, 30), { speed: 70, backward: true });
            await Mep.Motion.go(new TunedPoint(0, 210), { speed: 70, backward: true });

            try { await lunar.openLimiter(); } catch (e) {}
            try { await lunar.collect(); } catch (e) {}
            await Delay(1500);
            try { await lunar.prepare(); } catch (e) {}

            // Last module
            await Delay(5000);
            await Mep.Motion.straight(100);
            await Mep.Motion.straight(-100);

            // await this.home();
        } catch (e) {
            Mep.Log.error(TAG, e);
        }

        this.finish();
    }
}

module.exports = InitTask;
