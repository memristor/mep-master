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
            if (true) {
                position.set(new TunedPoint(-735, -850), { pathfinding: true})
                    .then(() => {
                        return position.set(new TunedPoint(765, -850), {pathfinding: true})
                    })
                    .then(() => {
                        return position.set(new TunedPoint(-1200, 400), {pathfinding: true})
                    })
                    .then(() => {
                        return position.set(new TunedPoint(-170, 820), {pathfinding: true})
                    });
            } else {
                //await position.set(new TunedPoint(20, 0), {speed: 100});
                //await position.set(new TunedPoint(0, 0), { pathfinding: true });
                //await position.set(new TunedPoint(30, 30), { pathfinding: true });
            }
        }, 200);



        /*
        hand.open();
        await position.set(new TunedPoint(2370, 1130), { pathfinding: true });
        await position.set(new TunedPoint(30, 30), { pathfinding: true });
        */
    }

}

module.exports = InitTask;
