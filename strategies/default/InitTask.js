const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const starter = Mep.getDriver('StarterDriver');
const Delay = Mep.require('misc/Delay');

const TAG = 'InitTask';

class InitTask extends Task {
    constructor(scheduler, weight, time, location) {
        super(scheduler, weight, time, location);

        this.lunar = Mep.getDriver('LunarCollector');
    }

    // Simplified functions for prompt
    go(x, y, config) {
        Mep.Motion.go(new TunedPoint(x, y), config);
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

    async onRun() {
        await starter.waitStartSignal(this);

        try {
            //await Mep.Motion.go(new TunedPoint(0, 0), { speed: 80, tolerance: -1, pf: false, rerouting: false });

            for (let i = 0; i < 4; i++) {
                await this.lunar.collect();
                await Delay(700);
                await Mep.Motion.straight(-20);
                await Delay(1000);
                await this.lunar.prepare();
                await Mep.Motion.straight(20);
            }
            await this.lunar.standby();


            // await this.home();
        } catch (e) {
            Mep.Log.error(TAG, e);
        }

        this.finish();
    }
}

module.exports = InitTask;
