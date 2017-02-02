'use strict';
/** @namespace drivers.starter */

const EventEmitter = require('events');
const readline = require('readline');

/**
 * Detects when rope is pulled out of the robot and starts counting game time.
 * @fires StarterDriver#tick
 * @memberof drivers.starter
 */
class StarterDriver extends EventEmitter {
    constructor(name, config) {
        super();

        if (['delay', 'rope', 'keyboard'].indexOf(config.type) == -1) {
            throw '`config.type` must be delay, rope or keyboard';
        }

        this.name = name;
        this.config = config;

        this.started = false;
        this.startTime;
    }

    _tick() {
        /**
         * Tick event
         * @event StarterDriver#tick
         * @property {Number} time - Time in seconds since match is started
         */
        this.emit('tick', this.getTime());
        setTimeout(this._tick.bind(this), 1000);
    }

    _initMatchStart() {
        this.startTime = process.hrtime();
        this._tick();
    }

    /**
     * Get time in seconds since match is started
     * @return {number} - Seconds since match is started
     */
    getTime() {
        return this.getTimeMills() / 1e3;
    }

    /**
     * Get time in milliseconds since match is started
     * @return {number} - Milliseconds since match is started
     */
    getTimeMills() {
        if (this.started === false) {
            return 0;
        }

        let diffTime = process.hrtime(this.startTime);
        return (diffTime[0] * 1e3 + diffTime[1] / 1e6);
    }

    /**
     * Wait a start match signal (pulled rope, pressed key or delay)
     * @return {Promise}
     */
    waitStartSignal() {
        let starterDriver = this;

        return new Promise((resolve, reject) => {
            switch (starterDriver.config.type) {
                // Delay mode
                case 'delay':
                    setTimeout(() => {
                        resolve();
                        starterDriver._initMatchStart();
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

                    rl.question('Application is ready, press [ENTER] to start robot...\n', (answer) => {
                        resolve();
                        starterDriver._initMatchStart();
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