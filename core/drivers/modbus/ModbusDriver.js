const ModbusDriverBinder = require('bindings')('modbus').ModbusDriverBinder;
const EventEmiter = require('events');
const Util = require('util');

Util.inherits(ModbusDriverBinder, EventEmiter);

module.exports = ModbusDriverBinder;



var modbus = new ModbusDriverBinder();

modbus.on('coilChanged', function(slaveAddress, functionAddress, state, id) {
    console.log('Coil Changed! Slave address: ' + slaveAddress + '; Function address: ' +
        functionAddress + '; State: ' + state);
});

modbus.registerCoilReading(1, 2);


setTimeout(() => {}, 5 * 1000);