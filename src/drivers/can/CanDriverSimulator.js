'use strict';
/** @namespace drivers.can */

const EventEmitter = require('events').EventEmitter;

const TAG = 'CanDriverSimulator';

/**
 * Driver that simulates CAN bus
 * @fires CanDriver#data
 * @fires CanDriver#data_[id]
 * @memberOf drivers.can
 */
class CanDriverSimulator extends EventEmitter {
    constructor(name, config) {
        super();

        let canDriverSimulator = this;

        Mep.Telemetry.on(Mep.Telemetry.genOn(TAG, 'Data'), (packet) => {
            canDriverSimulator.emit('data_' + packet.params.id, packet.params.data);
            canDriverSimulator.emit('data', packet.params.id, packet.params.data);
        });
    }

    getGroups() {
        return [];
    }
}

module.exports = CanDriverSimulator;