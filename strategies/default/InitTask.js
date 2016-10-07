const Task = Mep.require('utils/Task');
const TunedPoint = Mep.require('types/TunedPoint');

const DriverManager = Mep.require('drivers/DriverManager');
const position = Mep.require('services/ServiceManager').get().getPositionService();

const TAG = 'InitTask';

class InitTask extends Task {
    constructor(weight, time, location) {
        super(weight, time, location);

        Mep.Log.debug(TAG, 'Initialized');
    }

    onRun() {
        position.set(new TunedPoint(600, 0), {speed: 100});
    }

}

module.exports = InitTask;
