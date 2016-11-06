/** @namespace drivers */

const TAG = 'DriverManager';

/**
 * <p>Control drivers implemented in the platform.</p>
 *
 * The main goals of DriverManager are:
 * <ul>
 *  <li>driver initialization and passing arguments dependent to configuration,</li>
 *  <li>filter drivers by data which they provide,</li>
 *  <li>check if driver is available,</li>
 *  <li>monitor if driver is active and to try to recover if it is not (not implemented yet).</li>
 * </ul>
 *
 * List of of data types which driver can provide: control, terrain & position.
 *
 * @memberof drivers
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class DriverManager {
    constructor() {
        this.drivers = {};
        this.driversOutOfOrder = {};
    }

    init() {
        // Drivers initialization
        let config = Mep.Config.get('Drivers');

        for (let driverIdentifier in config) {
            if (config.hasOwnProperty(driverIdentifier) == false) {
                continue;
            }

            let moduleConfig = config[driverIdentifier];
            let load = moduleConfig.load;
            let classPath = moduleConfig.class;

            // Do not initialize if `init field == false`
            if (load != false) {
                let ModuleClass = Mep.require(classPath);

                if (typeof ModuleClass === 'function') {
                    try {
                        let driverInstance = new ModuleClass(driverIdentifier, moduleConfig);
                        this.drivers[driverIdentifier] = driverInstance;
                        Mep.Log.debug(TAG, 'Driver `' + driverIdentifier + '` loaded');
                    } catch (error) {
                        this.putDriverOutOfOrder(driverIdentifier, error);
                    }
                }

                 else {
                    Mep.Log.error(TAG, 'There is no module on path', modulePath);
                }
            }
        }
    }

    isDriverOutOfOrder(name) {
        return (name in this.driversOutOfOrder);
    }

    /**
     * Get driver instance by driver name
     *
     * @param name {String} - Driver name, eg. "MotionDriver", or "ModbusDriver".
     * @returns {Object} - Required driver
     */
    getDriver(name) {
        if (this.isDriverAvailable(name) === false) {
            let message = 'There is no driver with name ' + name;
            Mep.Log.error(TAG, message);
            throw new Error(message);
        }

        return this.drivers[name];
    }

    /**
     * Returns true if driver is available
     * @param name - Driver name
     * @returns {boolean} - Is driver available
     */
    isDriverAvailable(name) {
        return (name in this.drivers);
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

    putDriverOutOfOrder(name, message) {
        // Move to outOfOther pool
        if (this.isDriverAvailable(name) === true) {
            delete this.drivers[name];
        }
        this.driversOutOfOrder[name] = true;

        // Notify user
        Mep.Log.error(TAG, name, message);
        Mep.Log.error(TAG, name, 'is out of the order');
    }
}

module.exports = DriverManager;
