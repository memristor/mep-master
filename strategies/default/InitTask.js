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
            position.set(new TunedPoint(20, 0), {speed: 100})
                .then(() => {
                    return position.set(new TunedPoint(2370, 1130), { pathfinding: true })
                })
                .then(() => {
                    return position.set(new TunedPoint(30, 30), { pathfinding: true })
                });
        }, 200);
    }

}

module.exports = InitTask;
