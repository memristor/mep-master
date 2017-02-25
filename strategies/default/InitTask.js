const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const starter = Mep.getDriverManager().getDriver('StarterDriver');

const TAG = 'InitTask';

class InitTask extends Task {
    async onRun() {
        await starter.waitStartSignal();

        // Let's move around
        try {
            let config = { speed: 120, pf: true, tolerance: 150 };

            await Mep.Motion.go(new TunedPoint(900, 0), config);
            await Mep.Motion.go(new TunedPoint(-1300, 0), config);
            await Mep.Motion.rotate(new TunedAngle(0), { speed: 30 });


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
