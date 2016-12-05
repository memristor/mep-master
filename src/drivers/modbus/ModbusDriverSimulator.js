const EventEmitter = require('events');

const TAG = 'ModbusDriverSimulator';

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