const Task = Mep.require('utils/Task');
const TunedPoint = Mep.require('types/TunedPoint');
const Point = Mep.require('types/Point');

const DriverManager = Mep.require('drivers/DriverManager');
const position = Mep.require('services/ServiceManager').get().getPositionService();

const TAG = 'InitTask';

class InitTask extends Task {
    constructor(weight, time, location) {
        super(weight, time, location);

        Mep.Log.debug(TAG, 'Initialized');
    }

    onRun() {
        position.set(new TunedPoint(new Point(500, 0)), {speed: 100});
    }

}

module.exports = InitTask;
