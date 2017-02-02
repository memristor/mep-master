'use strict';
/** @namespace drivers.modbus */

const EventEmitter = require('events');

const TAG = 'ModbusDriverSimulator';

/**
 * Simulation for Modbus communication protocol
 * @memberOf drivers.modbus
 */
class ModbusDriverSimulator extends EventEmitter {
    constructor(name, config) {
        super();

        Mep.Log.debug(TAG, 'Driver with name', name, 'initialized');
    }

    registerCoilReading(slaveAddress, functionAddress) {

    }

    getGroups() {
        return [];
    }
}

module.exports = ModbusDriverSimulator;