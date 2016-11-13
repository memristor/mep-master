const Task = Mep.require('utils/Task');
const TunedPoint = Mep.require('types/TunedPoint');

const position = Mep.getPositionService();

const TAG = 'InitTask';

class InitTask extends Task {
    constructor(weight, time, location) {
        super(weight, time, location);

        Mep.Log.debug(TAG, 'Initialized');
    }

    onRun() {
        setTimeout(() => {
            position.set(new TunedPoint(600, 0), {speed: 100})
                .then(() => {
                    return position.set(new TunedPoint(300, 0))
                })
                .then(() => {
                    return position.set(new TunedPoint(600, 200))
                })
                .then(() => {
                    return position.set(new TunedPoint(0, 0))
                });
        }, 200);
    }

}

module.exports = InitTask;
