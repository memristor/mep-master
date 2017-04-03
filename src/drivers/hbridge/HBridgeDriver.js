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

    start(speed, inverse = false) {
        let buffer = Buffer.from([
            speed | 0,
            (inverse === true) ? 1 : 0
        ]);

        this.communicator.send(this.config.cid, buffer);
    }

    stop() {
        this.start(0);
    }

    getGroups() {
        return [];
    }
}

module.exports = HBridgeDriver;