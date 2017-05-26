const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const Delay = Mep.require('misc/Delay');
const Console = require('./Console');

// Drivers
const starter = Mep.getDriver('StarterDriver');
const ballPicker = Mep.getDriver('BallPicker');
const directionBall = Mep.getDriver('DirectionBall');


const TAG = 'InitTask';

class InitTask extends Task {
    async onRun() {
        ballPicker.setSpeed(400);
        ballPicker.setPosition(190);
        directionBall.setPosition(170);
        await starter.waitStartSignal(new Console());

        for (let i = 0; i < 3; i++) {
            try {
                await Mep.Motion.go(new TunedPoint(-500, -790, [500, -790, 'blue']), { speed: 110 });
                await Delay(200);
                ballPicker.setPosition(445);
                directionBall.setPosition(500);
                i = 3;
            } catch (e) {

            }
        }
        this.finish();
    } 
}

module.exports = InitTask;
