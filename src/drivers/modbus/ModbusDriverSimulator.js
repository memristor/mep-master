const BaseDriver = Mep.require('types/BaseDriver');

const TAG = 'ModbusDriverSimulator';

class ModbusDriverSimulator extends BaseDriver {
    constructor(name, config) {
        super();

        Mep.Log.debug(TAG, 'Driver with name', name, 'initialized');
    }

    registerCoilReading(slaveAddress, functionAddress) {

    }
}

module.exports = ModbusDriverSimulator;