const ModbusDriverBinder = require('bindings')('modbus').ModbusDriverBinder;
const EventEmiter = require('events');
const Util = require('util');

const TAG = 'ModbusDriver';

Util.inherits(ModbusDriverBinder, EventEmiter);

class ModbusDriver extends ModbusDriverBinder {
    constructor(name, config) {

        super((functionAddress, slaveAddress, detected) => {
            // Emit
            super.emit('coilChanged', slaveAddress, functionAddress, detected);
            super.emit('coilChanged_' + slaveAddress + '_' + functionAddress, detected);

            // Send to Logger
            Mep.Log.debug(TAG, 'Coil Changed', {
                slaveAddress: slaveAddress,
                functionAddress: functionAddress,
                detected: detected
            });
        }, () => {
        });

        Mep.Log.debug(TAG, 'Driver with name', name, 'initialized');
    }

}

module.exports = ModbusDriver;


/*
 var modbus = new ModbusDriver(function(e) {
 console.log('cccc' + e);
 }, function(e) {
 console.log('CCC' + e);
 });

 modbus.registerCoilReading(1, 2);


 setTimeout(() => {}, 5 * 1000);
 */
