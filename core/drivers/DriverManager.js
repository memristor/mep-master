/** @namespace drivers */

const SimulationSuffix = (Mep.Config.get('Simulation') === true) ? 'Simulator' : '';

const SingletonException = require('../exceptions/SingletonException');
const MotionDriver = require(Mep.Config.get('Drivers.MotionDriver.class') + SimulationSuffix);
const ModbusDriver = require(Mep.Config.get('Drivers.ModbusDriver.class') + SimulationSuffix);

const TAG = 'DriverManager';

var instance = null;

/**
 * <p>DriverManager's purpose is to manage drivers.</p>
 *
 * The main goals of Driver manager are:
 * <ul>
 *  <li>to choose which drivers to initialize for the big robot and the small robot,</li>
 *  <li>to initialize drivers with correct parameters,</li>
 *  <li>to choose between simulation and hardware implementation of driver,</li>
 *  <li>to provide correct instance of driver,</li>
 *  <li>to monitor if driver is active and to try to recover if it is not.</li>
 * </ul>
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
     * Get instance of DriverManager. Do not use `new` to get instance of DriverManager!
     * @returns {DriverManager}
     */
    static get() {
        if (instance == null) {
            instance = new DriverManager();
        }
        return instance;
    }

    /**
     * Get driver instance by driver name
     *
     * @param name {String} - Service name. Eg. `DriverManager.MOTION_DRIVER` or `DriverManager.MODBUS_DRIVER`
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
