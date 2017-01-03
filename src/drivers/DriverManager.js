/** @namespace drivers */
const DriverChecker = require('./DriverChecker');

const TAG = 'DriverManager';

/**
 * <p>Class manipulate drivers</p>
 *
 * DriverManager provides mechanisms to:
 * <ul>
 *  <li>initialize and configure drivers based on config files,</li>
 *  <li>return instance of driver by driver unique identifier,</li>
 *  <li>filter drivers by groups,</li>
 *  <li>check if driver is available,</li>
 *  <li>resolve dependencies and</li>
 *  <li>put driver out of order or recover driver if it is possible.</li>
 * </ul>
 *
 * Each driver can be part of one or more of following groups: control, terrain & position.
 *
 * @memberof drivers
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class DriverManager {
    constructor() {
        this.drivers = {};
        this.driversOutOfOrder = {};
        this.initialized = false;
    }


    /**
     * Initialize all drivers
     */
    init() {
        // Protect from multiple initialization
        if (this.initialized === true) {
            return;
        }
        this.initialized = true;

        // Drivers initialization
        let config = Mep.Config.get('Drivers');

        for (let driverIdentifier in config) {
            if (config.hasOwnProperty(driverIdentifier) === false) {
                continue;
            }

            // Initialize driver
            this._initDriver(config, driverIdentifier);
        }
    }

    _initDriver(config, driverIdentifier) {
        let moduleConfig = config[driverIdentifier];

        if (moduleConfig === undefined) {
            throw Error('Driver ' + driverIdentifier + ' is missing in configuration. Some driver probably depends on ' + driverIdentifier + ' driver');
        }

        if (this.isDriverAvailable(driverIdentifier) || this.isDriverOutOfOrder(driverIdentifier)) {
            return;
        }

        // Load driver
        let load = moduleConfig['@load'];
        let classPath = moduleConfig['@class'];

        // Do not initialize if `load field == false`
        if (load != false) {
            let ModuleClass = Mep.require(classPath);

            // Resolve dependencies
            if (moduleConfig['@dependencies'] !== undefined) {
                this._resolveDependencies(config, moduleConfig['@dependencies']);
            }

            if (typeof ModuleClass === 'function') {
                let driverInstance;
                let loadedWithoutErrors = true;
                try {
                    driverInstance = new ModuleClass(driverIdentifier, moduleConfig);
                    this.drivers[driverIdentifier] = driverInstance;
                    Mep.Log.debug(TAG, 'Driver `' + driverIdentifier + '` loaded');
                } catch (error) {
                    loadedWithoutErrors = false;
                    this.putDriverOutOfOrder(driverIdentifier, error);
                }

                // Test if all methods are OK
                if (loadedWithoutErrors === true) {
                    DriverChecker.check(driverInstance);
                }
            }

            else {
                Mep.Log.error(TAG, 'There is no module on terrain', modulePath);
            }
        }
    }

    _resolveDependencies(config, dependecies) {
        for (let key in dependecies) {
            let dependentDriverIdentifier = dependecies[key];

            if (this.isDriverAvailable(dependentDriverIdentifier) === true) {
                continue;
            }

            if (this.isDriverOutOfOrder(dependentDriverIdentifier) === true) {
                this.putDriverOutOfOrder(driverIdentifier,
                    'Cannot resolve dependency: ' + dependentDriverIdentifier);
            }

            this._initDriver(config, dependentDriverIdentifier);
        }
    }

    /**
     * Check if driver is out of order
     * @param name {String} - Unique name of a driver
     * @returns {boolean}
     */
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
    getDriversByGroup(type) {
        var filteredDrivers = {};

        for (let driverKey in this.drivers) {
            if (this.drivers.hasOwnProperty(driverKey) == false) {
                continue;
            }

            // Check if driver has defined list of data types which can provide
            if (typeof this.drivers[driverKey].getGroups !== 'function') {
                continue;
            }

            // Check if driver can provide data
            if (this.drivers[driverKey].getGroups().indexOf(type) >= 0) {
                filteredDrivers[driverKey] = this.drivers[driverKey];
            }
        }

        return filteredDrivers;
    }

    /**
     * Put driver out of order
     * @param name {String} - Unique name of a driver
     * @param message {String} - Describe more why the fault happened
     */
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
