const EventEmiter = require('events');

const TAG = 'ModbusDriverSimulator';

class ModbusDriverSimulator extends EventEmiter {
    constructor(name, config) {
        super();

        Mep.Log.debug(TAG, 'Driver with name', name, 'initialized');
    }

    registerCoilReading(slaveAddress, functionAddress) {

    }
}

module.exports = ModbusDriverSimulator;