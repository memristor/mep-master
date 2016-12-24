/** @namespace drivers.starter */

const EventEmitter = require('events');

/**
 * Detects when rope is pulled out of the robot and starts counting game time.
 * @memberof drivers.starter
 */
class StarterDriver extends EventEmitter {
    constructor(name, config) {
        super();

        this.started = false;
        this.startTime;
        this.config = config;
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
            switch (starterDriver.config.type) {
                case 'delay':
                    setTimeout(() => {
                        resolve();
                        starterDriver.startTime = process.hrtime();
                    }, 1000);
                    break;

                case 'rope':
                    throw Error('Rope detector is not implemented');
                    break;

                case 'keyboard':
                    throw Error('Keyboard starter is not implemented');
                    break;

                default:
                    throw Error('rope, delay & keyboard are only available methods, check spelling');
                    break;
            }
        });
    }

    getGroups() {
        return [];
    }
}

module.exports = StarterDriver;