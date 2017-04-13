const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const starter = Mep.getDriver('StarterDriver');
const Delay = Mep.require('misc/Delay');
const Point = Mep.require('misc/Point');


const TAG = 'InitTask';

class InitTask extends Task {
    constructor(scheduler, params) {
        super(scheduler, params);

        this.lunar = Mep.getDriver('LunarCollector');
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

        this.c(9, 329.5); // 329.5
        this.c(10, 92.6); // 92.6
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
        this.test();

        await starter.waitStartSignal(this);

        // await Mep.Motion.go(new TunedPoint(0, 0), { speed: 100 });
        let config = { speed: 90, tolerance: 150, pf: false, rerouting: false };
        if (false) {
            await Mep.Motion.go(new TunedPoint(-1000, -100), config);
            await Mep.Motion.go(new TunedPoint(-700, 100), config);
            await Mep.Motion.go(new TunedPoint(-400, -100), config);
            await Mep.Motion.go(new TunedPoint(-100, 100), config);
        }


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
