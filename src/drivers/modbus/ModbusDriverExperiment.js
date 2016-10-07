global.Mep = require('../../Mep');
const ModbusDriver = require('./ModbusDriver');

let modbus = new ModbusDriver('ModbusDriverExperiment');
modbus.on('coilChanged', function(functionAddress, slaveAddress) {
    Mep.Log.debug('Coil Changed', functionAddress, slaveAddress);
});