const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const starter = Mep.getDriver('StarterDriver');
const Delay = Mep.require('misc/Delay');

const TAG = 'InitTask';

class InitTask extends Task {
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
        await Mep.Motion.go(new TunedPoint(-1300, 0), { pf: true, tolerance: -1, speed: 100 });
        await Delay(200);
        await Mep.Motion.rotate(new TunedAngle(0));
        console.log('Arrived to home');
    }

    get m() {
        return Mep.getDriver('MotionDriver');
    }

    async onRun() {
        await starter.waitStartSignal(this);
        await Mep.Motion.go(new TunedPoint(400, 0), { speed: 100, tolerance: -1, pf: true });
        // Let's move around
        /*
        try {
            let config = { speed: 150, pf: true, tolerance: 100 };

            await Mep.Motion.go(new TunedPoint(-83, 564), config);
            await Mep.Motion.go(new TunedPoint(-650, 300), config);
            return;


            await Mep.Motion.go(new TunedPoint(0, 600), config);
            await Mep.Motion.go(new TunedPoint(620, -620), config);
            await Mep.Motion.go(new TunedPoint(-800, -620), config);
            await Mep.Motion.go(new TunedPoint(-1300, 0), config);

            await Delay(500);
            await Mep.Motion.rotate(new TunedAngle(0));
            await Delay(500);


        } catch (e) {
            Mep.Log.error(TAG, e);
            await this.onErrorForwardBack(e);
        }
        */

        this.finish();
    }

    async onErrorForwardBack(taskError) {
        console.log(taskError);
        try {
            //await Mep.Motion.straight(Mep.Motion.getDirection() * (-100));
            await Mep.Motion.go(new TunedPoint(-1300, 0), {tolerance: 100, speed: 120, pf: true});
            await Mep.Motion.rotate(new TunedAngle(0), {speed: 30});
        } catch (e) {
            console.log(e);
            this.finish();
        }
    }

}

module.exports = InitTask;
