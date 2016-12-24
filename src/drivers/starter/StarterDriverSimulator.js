/** @namespace drivers.starter */

const EventEmitter = require('events');
const Delay = Mep.require('utils/Delay');

/**
 * Detects when rope is pulled out of the robot and starts counting game time.
 * @memberof drivers.starter
 */
class StarterDriverSimulator extends EventEmitter {
    constructor(name, config) {
        super();

        this.started = false;
        this.startTime;
    }

    getTime() {
        return this.getTimeMills() / 1e3;
    }

    getTimeMills() {
        if (this.started === false) {
            return 0;
        }

        let diffTime = process.hrtime(this.startTime);
        return (diffTime[0] * 1e3 + diffTime[1] / 1e6);
    }

    waitStartSignal() {
        let starterDriver = this;

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
                starterDriver.startTime = process.hrtime();
            }, 1000);
        });
    }

    getGroups() {
        return [];
    }
}

module.exports = StarterDriverSimulator;