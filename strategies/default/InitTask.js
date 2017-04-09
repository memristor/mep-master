const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const starter = Mep.getDriver('StarterDriver');
const Delay = Mep.require('misc/Delay');

const TAG = 'InitTask';

class InitTask extends Task {
    constructor(scheduler, weight, time, location) {
        super(scheduler, weight, time, location);

        //this.lunar = Mep.getDriver('LunarCollector');
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
        Mep.getDriver('MotionDriver').setRefreshInterval(50);
        this.t.c(9, 329.5);
        this.t.c(10, 91);
        this.t.c(10, 91);

        for (let i = 0; i < 0; i++) {
            await Mep.Motion.go(new TunedPoint(0, 500));
            await Mep.Motion.go(new TunedPoint(1000, 500));
            await Mep.Motion.go(new TunedPoint(1000, -100));
            await Mep.Motion.go(new TunedPoint(0, -100));
        }
    }

    async onRun() {

        //await Mep.Motion.go(new TunedPoint(500, 500));

        // Mep.getDriver('MotionDriver').setPositionAndOrientation(0, 0, 0);
        await starter.waitStartSignal(this);
        //for (let i = 0; i < 4; i++) await this.test();
        //await this.go(700, 0);
        //await this.home();
        //return;

        let config = { speed: 70, tolerance: 150, pf: false, rerouting: false };

        if (true) {
            await Mep.Motion.go(new TunedPoint(-1000, -100), config);
            await Mep.Motion.go(new TunedPoint(-700, 100), config);
            await Mep.Motion.go(new TunedPoint(-400, -100), config);
            await Mep.Motion.go(new TunedPoint(-100, 100), config);
        }

        //await Mep.Motion.go(new TunedPoint(500, -100), config);
        //await this.home();

        return;
        try {
            //await Mep.Motion.go(new TunedPoint(0, 0), { speed: 80, tolerance: -1, pf: false, rerouting: false });

            for (let i = 0; i < 4; i++) {
                await this.lunar.collect();
                //await Delay(700);
                if (i !== 3) {
                    await Mep.Motion.straight(-15);
                    await Delay(1200);
                    this.lunar.prepare();
                    await Mep.Motion.straight(15);
                } else {
                    await Delay(1000);
                }
            }
            //await this.lunar.standby();
            await Mep.Motion.straight(-50);

            // await this.home();
        } catch (e) {
            Mep.Log.error(TAG, e);
        }

        this.finish();
    }
}

module.exports = InitTask;
