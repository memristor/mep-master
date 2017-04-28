'use strict';
/** @namespace drivers.starter */

const EventEmitter = require('events');
const readline = require('readline');

const TunedPoint = Mep.require('strategy/TunedPoint');
const Point = Mep.require('misc/Point');

const TAG = 'StarterDriver';

/**
 * Detects when rope is pulled out of the robot and starts counting game time.
 * @fires drivers.starter.StarterDriver#tick
 * @memberof drivers.starter
 */
class StarterDriver extends EventEmitter {
    constructor(name, config) {
        super();

        this.config = Object.assign({

        }, config);
        this.name = name;


        if (['delay', 'rope', 'keyboard'].indexOf(config.type) === -1) {
            throw '`config.type` must be delay, rope or keyboard';
        }

        this._tick = this._tick.bind(this);

        this._started = false;
        this._secondPassed = 0;
        this._ropePin = null;
        this._startTime = 0;
        this._duration = Mep.Config.get('duration');

        if (this.config.type === 'rope') {
            this._ropePin = Mep.getDriver(this.config['@dependencies']['ropePin']);
        }
    }

    _tick() {
        this._secondPassed++;
        /**
         * Tick event
         * @event drivers.starter.StarterDriver#tick
         * @property {Number} time Time in seconds since match is started
         */
        this.emit('tick', this._secondPassed);
    }

    _initMatchStart() {
        this._started = true;
        this._startTime = process.hrtime();
        setInterval(this._tick, 1000);
    }

    getRemainingTime() {
        return (this._duration - this.getTime());
    }

    /**
     * Get time in seconds since match is started
     * @return {number} - Seconds since match is started
     */
    getTime() {
        return (this.getTimeMills() / 1e3);
    }

    /**
     * Get time in milliseconds since match is started
     * @return {Number} Milliseconds since match is started
     */
    getTimeMills() {
        if (this._started === false) {
            return 0;
        }

        let diffTime = process.hrtime(this._startTime);
        return (diffTime[0] * 1e3 + diffTime[1] / 1e6);
    }

    /**
     * Wait a start match signal (pulled rope, pressed key or delay)
     * @param t {Object} - Context for interactive prompt
     * @return {Promise}
     */
    waitStartSignal(t = null) {
        let starterDriver = this;

        Mep.Log.info('Software is initialized');

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
                    let ropePin = this._ropePin;
                    let pinListener = (value) => {
                        if (value === 0) {
                            resolve();
                            starterDriver._initMatchStart();
                            ropePin.removeListener('changed', pinListener);
                        }
                    };

                    this._ropePin.on('changed', pinListener);
                    break;

                // Keyboard mode
                case 'keyboard':
                    const rl = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout,
                        prompt: 'mep > '
                    });

                    Mep.Log.info('Press [ENTER] to start executing commands...');
                    Mep.Log.info('You can type a command (eg. `Mep.Motion.go()` or `t.home()`)...');

                    rl.on('line', (line) => {
                        if (line.length === 0) {
                            resolve();
                            starterDriver._initMatchStart();
                        } else {
                            try {
                                eval(line);
                            } catch (e) {
                                Mep.Log.error(TAG, e);
                            }
                        }
                        rl.prompt();
                    });
                    rl.prompt();
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