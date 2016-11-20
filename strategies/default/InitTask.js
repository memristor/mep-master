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
                position.set(new TunedPoint(100, -1200), {speed: 100})
                    .then(() => {
                        return position.set(new TunedPoint(50, -800), {pathfinding: true})
                    })
                    .then(() => {
                        return position.set(new TunedPoint(400, -850), {pathfinding: true})
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
