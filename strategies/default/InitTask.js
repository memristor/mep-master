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

    rotate(angle, config) {
        Mep.Motion.rotate(new TunedAngle(angle), config);
    }

    async home() {
        await Mep.Motion.go(new TunedPoint(-1300, 0), { pf: true, tolerance: 50, speed: 150 });
        await Delay(200);
        await Mep.Motion.rotate(new TunedAngle(0));
        console.log('Arrived to home');
    }

    get m() {
        return Mep.getDriver('MotionDriver');
    }

    async onRun() {
        await starter.waitStartSignal(this);

        // Let's move around
        try {
            let config = { speed: 150, pf: false, tolerance: -1 };

            await Mep.Motion.go(new TunedPoint(-200, 200), config);
            await Mep.Motion.go(new TunedPoint(-1300, 0), config);
            await Delay(1000);
            await Mep.Motion.stop();
            await Mep.Motion.rotate(new TunedAngle(0));


            //await Mep.Motion.go(new TunedPoint(700, -800), config);
            //await Mep.Motion.go(new TunedPoint(-750, -850), config);



            // await Mep.Motion.go(new TunedPoint(-1200, 0), config);
            /*
            await Mep.Motion.go(new TunedPoint(79, -6), config);
            await Mep.Motion.go(new TunedPoint(500, 100), config);
            config.speed += 20;
            await Mep.Motion.go(new TunedPoint(-1100, 0), config);

            //config.tolerance = -1;
            await Mep.Motion.go(new TunedPoint(-1300, 0), config);

            //Mep.Motion.stop();
            await Mep.Motion.rotate(new TunedAngle(0), { speed: 30 });
            */


        } catch (e) {
            Mep.Log.error(TAG, e);
            await this.onErrorForwardBack(e);
        }

        this.finish();
    }

    async onErrorForwardBack(taskError) {
        try {
            await Mep.Motion.straight(Mep.Motion.getDirection() * (-100));
            await Mep.Motion.go(new TunedPoint(-1300, 0), {tolerance: 100, speed: 120, pf: true});
            await Mep.Motion.rotate(new TunedAngle(0), {speed: 30});
            this.finish();
        } catch (e) {
            this.onErrorForwardBack();
        }
    }

}

module.exports = InitTask;
