/** @namespace drivers */

const ModuleLoader = Mep.require('utils/ModuleLoader');

const TAG = 'DriverManager';

/**
 * <p>Interact with the overall drivers implemented in the platform.</p>
 *
 * The main goals of DriverManager are:
 * <ul>
 *  <li>driver initialization and passing correct arguments depends on configuration,</li>
 *  <li>choosing driver implementation (hardware or simulation),</li>
 *  <li>filter drivers by data which they provide,</li>
 *  <li>check if driver is available,</li>
 *  <li>monitor if driver is active and to try to recover if it is not (not implemented).</li>
 * </ul>
 *
 * @memberof drivers
 */
class DriverManager {
    constructor() {
        // Drivers initialization
        this.drivers = ModuleLoader.load(
            Mep.Config.get('Drivers'),
            Mep.Config.get('Simulation')
        );
    }

    /**
     * Get driver instance by driver name
     *
     * @param name {String} - Driver name, eg. "MotionDriver", or "ModbusDriver".
     * @returns {Object} - Required driver
     */
    getDriver(name) {
        if (this.isDriverAvailable(name) === false) {
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
        return (name in this.drivers)
    }

    /**
     * <p>Get all drivers that can provide specific type of data.</p>
     *
     * <p>Every driver that can provide a certain type of data has implemented
     * universal mechanism for getting that data from the driver. That is extremely
     * useful for services and in that case services implement only logic for
     * data processing, not mechanisms for data collection from different drivers.
     * Services are in this case also hardware independent.</p>
     *
     * @param type {String} - Data type which driver can provide. Can be: position & terrain.
     * @returns {Object} - List of filtered drivers
     */
    getDataProviderDrivers(type) {
        var filteredDrivers = {};

        for (let driverKey in this.drivers) {
            if (this.drivers.hasOwnProperty(driverKey) == false) {
                continue;
            }

            // Check if driver has defined list of data types which can provide
            if (typeof this.drivers[driverKey].provides !== 'function') {
                Mep.Log.warn(TAG, driverKey, 'doesn\'t have member provides()');
                continue;
            }

            // Check if driver can provide data
            if (this.drivers[driverKey].provides().indexOf(type) >= 0) {
                filteredDrivers[driverKey] = this.drivers[driverKey];
            }
        }

        return filteredDrivers;
    }
}

module.exports = DriverManager;
