'use strict';

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
 * @memberOf drivers
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class DriverManager {
    constructor() {
        this.drivers = {};
        this.driversOutOfOrder = {};
        this.config = Mep.Config.get('Drivers');
    }

    /**
     * Initialize all drivers
     */
    async init() {
        // Iterate through all drivers in config and initialize them
        for (let name of Object.keys(this.config)) {
            try {
                await this._initDriver(name);
            } catch (e) {
                Mep.Log.error(e);
            }
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
        let filteredDrivers = {};

        for (let driverKey in this.drivers) {
            if (this.drivers.hasOwnProperty(driverKey) == false) {
                continue;
            }

            // Check if driver has defined list of data misc which can provide
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
     * <p>Get all drivers that can provide specific type of data (or execute specific command) and call method.</p>
     *
     * <p>Eg. imagine you have laptop and monitor. If a monitor is not available then your laptop is it totally ok with it,
     * image will be sent only to laptop's monitor. However, if there is a monitor connected to the laptop then laptop
     * will be aware of monitor and it will send an image to monitor too. Your laptop don't really recognize difference
     * between displays, and it communicates between them in very similar way. To sum up, the same is for this method,
     * method will be called to all drivers that are the part of the group.</p>
     *
     * @param type {String} - Data type which driver can provide. Can be: position & terrain.
     * @param method {String} - Method to be called.
     * @param params {Array} - Params to be passed to method.
     *
     * @see DriverManager.getDriversByGroup
     */
    callMethodByGroup(type, method, params) {
        let drivers = this.getDriversByGroup(type);
        for (let key in drivers) {
            drivers[key][method](...params);
        }
    }

    /**
     * Put driver out of order
     * @param name {String} - Unique name of a driver
     * @param message {String} - Describe more why the fault happened
     */
    putDriverOutOfOrder(name, message) {
        // Check if it is already out of order
        if (this.isDriverOutOfOrder(name) === true) {
            return;
        }

        // Move to outOfOther pool
        if (this.isDriverAvailable(name) === true) {
            delete this.drivers[name];
        }
        this.driversOutOfOrder[name] = true;

        // Notify user
        Mep.Log.error(TAG, name, 'is out of the order', message);
    }

    async _initDriver(driverIdentifier) {
        let moduleConfig = this.config[driverIdentifier];

        if (moduleConfig === undefined) {
            throw Error('Driver ' + driverIdentifier + ' is missing in configuration. ' +
                'Some driver probably depends on ' + driverIdentifier + ' driver');
        }

        if (this.isDriverAvailable(driverIdentifier) || this.isDriverOutOfOrder(driverIdentifier)) {
            return;
        }

        // Load driver
        let load = moduleConfig['@load'];
        let classPath = moduleConfig['@class'];
        // Do not initialize if `load field == false`
        if (load !== false) {
            let ModuleClass = Mep.require(classPath);

            // Resolve dependencies
            if (moduleConfig['@dependencies'] !== undefined) {
                try {
                    await this._resolveDependencies(moduleConfig['@dependencies']);
                    await this._loadDriverBasic(ModuleClass, moduleConfig, driverIdentifier, classPath);
                } catch (e) {
                    throw Error('Cannot load driver `' + driverIdentifier + '` because dependencies are out of order');
                }
            } else {
                await this._loadDriverBasic(ModuleClass, moduleConfig, driverIdentifier, classPath);
            }
        }
    }

    async _loadDriverBasic(ModuleClass, moduleConfig, driverIdentifier, classPath) {
        if (typeof ModuleClass === 'function') {
            let driverInstance;
            try {
                driverInstance = new ModuleClass(driverIdentifier, moduleConfig);
                this.drivers[driverIdentifier] = driverInstance;

                if (typeof driverInstance.init === 'function') {
                    await driverInstance.init();
                    Mep.Log.debug(TAG, 'Driver `' + driverIdentifier + '` initialized');
                } else {
                    Mep.Log.debug(TAG, 'Driver `' + driverIdentifier + '` created');
                }

                // Test if all methods are OK
                DriverChecker.check(driverInstance);
            } catch (error) {
                this.putDriverOutOfOrder(driverIdentifier, error);
            }
        } else {
            Mep.Log.error(TAG, 'There is no driver', classPath);
        }
    }

    async _resolveDependencies(dependencies) {
        for (let key in dependencies) {
            if (this.isDriverAvailable(dependencies[key]) === true) {
                continue;
            }

            if (this.isDriverOutOfOrder(dependencies[key]) === true) {
                this.putDriverOutOfOrder(dependencies[key],
                    'Cannot resolve dependency: ' + dependencies[key]);
                throw Error('Dependency `' + dependencies[key] + '` driver cannot be loaded');
            }

            await this._initDriver(dependencies[key]);
        }
    }
}

module.exports = DriverManager;
