/** @namespace drivers */

const ModuleLoader = Mep.require('utils/ModuleLoader');

const TAG = 'DriverManager';

var instance = null;

/**
 * <p>DriverManager's purpose is to manage drivers.</p>
 *
 * The main goals of Driver manager are:
 * <ul>
 *  <li>to choose which drivers to initialize and which arguments to pass depending on configuration,</li>
 *  <li>to choose between simulation and hardware implementation of driver,</li>
 *  <li>to provide correct instance of driver,</li>
 *  <li>to monitor if driver is active and to try to recover if it is not.</li>
 * </ul>
 * @memberof drivers
 */
class DriverManager {
    static get MOTION_DRIVER() { return 'MotionDriver'; }
    static get MODBUS_DRIVER() { return 'ModbusDriver'; }

    /**
     * @private
     */
    constructor() {
        if (instance != null) {
            throw new Error('DriverManger is not meant to be initialized');
        }
        
        // Drivers initialization
        this.drivers = ModuleLoader.load(
            Mep.Config.get('Drivers'),
            Mep.Config.get('Simulation')
        );
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
