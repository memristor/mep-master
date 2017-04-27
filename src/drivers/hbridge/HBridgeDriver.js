'use strict';

/** @namespace drivers.hbridge */

const TAG = 'HBridgeDriver';


/**
 * @param {Object} config Additional parameters
 * @param {Number} [config.cid] Communication ID
 * @param {String} [config.@dependecies.communicator] Name of communication driver
 * @memberOf drivers.hbridge
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class HBridgeDriver {
    constructor(name, config) {
        this.config = Object.assign({
            max: 255,
            min: 0
        }, config);
        this.name = name;


        // Set up communicator
        this.communicator = null;
        if (this.config._communicator !== undefined) {
            // For testing purposes only (experiments)
            this.communicator = this.config._communicator;
        } else {
            this.communicator = Mep.getDriver(this.config['@dependencies'].communicator);
        }
    }

    write(speed, inverse = false) {
        if (speed > this.config.max) {
            speed = this.config.max;
            Mep.Log.error(TAG, this.name, 'Max value is:', this.config.max);
        }
        else if (speed < this.config.min) {
            speed = this.config.min;
            Mep.Log.error(TAG, this.name, 'Min value is:', this.config.min);
        }

        let buffer = Buffer.from([
            speed | 0,
            (inverse === true) ? 1 : 0
        ]);

        this.communicator.send(this.config.cid, buffer);
    }

    getGroups() {
        return [];
    }
}

module.exports = HBridgeDriver;