const Task = Mep.require('strategy/Task');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');
const Delay = Mep.require('misc/Delay');
const Console = require('./Console');

// Drivers
const starter = Mep.getDriver('StarterDriver');
const ballPicker = Mep.getDriver('BallPicker');


const TAG = 'InitTask';

class InitTask extends Task {
    async onRun() {
        ballPicker.setSpeed(400);

        await starter.waitStartSignal(new Console());

        await Mep.Motion.go(new TunedPoint(-500, -790, [500, -790, 'blue']), { speed: 100 });

        this.finish();
    } 
}

module.exports = InitTask;
