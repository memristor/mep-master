const ModbusDriverBinder = require('bindings')('modbus').ModbusDriverBinder;
const EventEmiter = require('events');
const Util = require('util');

Util.inherits(ModbusDriverBinder, EventEmiter);


class ModbusDriver extends ModbusDriverBinder {
    get COIL_CHANGED() { return 'coilChanged'; }

    constructor() {
        super(() => {}, () => {});
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