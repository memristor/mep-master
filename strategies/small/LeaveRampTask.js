const Task = Mep.require('strategy/Task');
const Delay = Mep.require('misc/Delay');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');

// Drivers
const ballPicker = Mep.getDriver('BallPicker');
const directionBall = Mep.getDriver('DirectionBall');


const TAG = 'SmallHoleTask';

class SmallHoleTask extends Task {
    async onRun() {
       for (let i = 0; i < 10; i++) {
            try {
				// start position for yellow -1200, -790
				// go forward +700 from starting pos
                await Mep.Motion.go(new TunedPoint(-500, -790, [500, -790, 'blue']), { speed: 100 });
                // await Mep.Motion.go(new TunedPoint(-500, -790, [500, -790, 'blue']), { speed: 80 });
                //await Delay(500);
                break;
            } catch (e) {
                i = 3;
            }
        }
        ballPicker.setPosition(445);
        directionBall.setPosition(512);
        await Delay(500);
        this.finish();
    }
}

module.exports = SmallHoleTask;
