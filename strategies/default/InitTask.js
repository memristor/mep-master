const Task = require(__core + 'Task');
const MotionDriver = require(__core + 'drivers/motion/MotionDriver');

class InitTask extends Task {
    constructor() {
        super();
    }

    onRun() {
        var motionDriver = new MotionDriver(0, 0);



        setTimeout(function() {
            motionDriver.moveToPosition(23, 23, MotionDriver.DIRECTION_BACKWARD);
        }, 1000);
    }
}

module.exports = InitTask;