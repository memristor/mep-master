/** @namespace drivers.starter */

const EventEmitter = require('events');
const readline = require('readline');

/**
 * Detects when rope is pulled out of the robot and starts counting game time.
 * @memberof drivers.starter
 */
class StarterDriver extends EventEmitter {
    constructor(name, config) {
        super();

        if (['delay', 'rope', 'keyboard'].indexOf(config.type) == -1) {
            throw '`config.type` must be delay, rope or keyboard';
        }

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
                // Delay mode
                case 'delay':
                    setTimeout(() => {
                        resolve();
                        starterDriver.startTime = process.hrtime();
                    }, starterDriver.config.delayTimer);
                    break;

                case 'rope':
                    throw Error('Rope detector is not implemented');
                    break;

                // Keyboard mode
                case 'keyboard':
                    const rl = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });

                    rl.question('Application is ready, press [ENTER] to start robot... ', (answer) => {
                        resolve();
                        rl.close();
                    });
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