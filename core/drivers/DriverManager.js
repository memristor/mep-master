/** @namespace drivers */

const SimulationSuffix = (Mep.Config.get('Simulation') === true) ? 'Simulator' : '';

const SingletonException = require('../exceptions/SingletonException');
const MotionDriver = require(Mep.Config.get('Drivers.MotionDriver.class') + SimulationSuffix);
const ModbusDriver = require(Mep.Config.get('Drivers.ModbusDriver.class') + SimulationSuffix);

const TAG = 'DriverManager';

var instance = null;

/**
 * Manage drivers. Starts all drivers and provides instance of required driver
 * @memberof drivers
 */
class DriverManager {
    static get MOTION_DRIVER() { return 'MOTION_DRIVER'; }
    static get MODBUS_DRIVER() { return 'MODBUS_DRIVER'; }

    constructor() {
        if (instance != null) {
            throw new SingletonException('DriverManger is not meant to be initialized');
        }
        
        // Drivers initialization
        this.drivers = {};
        this.drivers[DriverManager.MOTION_DRIVER] = new MotionDriver(0, 0);
        this.drivers[DriverManager.MODBUS_DRIVER] = new ModbusDriver();
    }

    /**
     * Get instance of DriverManager. Don't `new` to get instance of DriverManager!
     * @returns {DriverManager}
     */
    static get() {
        if (instance == null) {
            instance = new DriverManager();
        }
        return instance;
    }

    /**
     * Get service instance by service name
     *
     * @param name {String} - Service name. Eg. `SCHEDULER`
     * @returns {Object} - Required service
     */
    getDriver(name) {
        let driver = this.drivers[name];

        if (typeof driver === 'undefined') {
            Mep.Log.error(TAG, 'There is no driver with name ' + name);
        }

        return driver;
    }
}

module.exports = DriverManager;
