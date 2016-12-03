const ModbusDriverBinder = require('bindings')('modbus').ModbusDriverBinder;
const BaseDriver = Mep.require('types/BaseDriver');

const TAG = 'ModbusDriver';
const DEBUG = true;

/**
 * Driver for Modbus communication protocol.
 *
 * @fires ModbusDriver#coilChanged
 * @fires ModbusDriver#coilChanged_[slaveAddress]_[functionAddress]
 */
class ModbusDriver extends classes(ModbusDriverBinder, BaseDriver) {

    /**
     * Creates instance of ModbusDriver
     *
     * @param name {String} - Unique name of a driver
     * @param config {Object} - Configuration presented as an associative array
     */
    constructor(name, config) {
        super(DEBUG, (functionAddress, slaveAddress, detected) => {
            /**
             * Coil value changed event.
             *
             * @event ModbusDriver#coilChanged
             * @property {Number} slaveAddress - Slave address
             * @property {Number} functionAddress - Function address
             * @property {Boolean} detected - Value on slave address and function address
             */
            super.emit('coilChanged', slaveAddress, functionAddress, detected);

            /**
             * Coil value changed event on single address.
             *
             * @event ModbusDriver#coilChanged_[slaveAddress]_[functionAddress]
             * @property {Boolean} detected - Value on slave address and function address
             */
            super.emit('coilChanged_' + slaveAddress + '_' + functionAddress, detected);

            // Send to Logger
            Mep.Log.debug(TAG, 'Coil Changed', {
                slaveAddress: slaveAddress,
                functionAddress: functionAddress,
                detected: detected
            });
        });

        Mep.Log.debug(TAG, 'Driver with name', name, 'initialized');
    }

}

module.exports = ModbusDriver;
