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
     * @param name {String} - Driver name, eg. "MotionDriver", or "ModbusDriver".
     * @returns {Object} - Required driver
     */
    getDriver(name) {
        if (this.isDriverAvailable(name)) {
            throw new Error('There is no driver with name ' + name);
        }

        return this.drivers[name];
    }

    /**
     * Returns true if driver is available
     * @param name - Driver name
     * @returns {boolean} - Is driver available
     */
    isDriverAvailable(name) {
        return (!(typeof this.drivers[name] === 'undefined'));
    }
}

module.exports = DriverManager;
