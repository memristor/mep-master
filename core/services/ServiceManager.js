/** @namespace services */

const SingletonException = require('../exceptions/SingletonException');
const SchedulerService = require('./scheduler/SchedulerService');

var instance = null;

/**
 * Manage services. Starts all services and provides instance of required service.
 * @memberof services
 */
class ServiceManager {
    static get SCHEDULER_SERVICE() { return 'SCHEDULER_SERVICE'; }

    constructor() {
        if (instance != null) {
            throw new SingletonException('DriverManger is not meant to be initialized');
        }

        // Start all services
        this.schedulerService = new SchedulerService();
    }

    /**
     * Get instance of ServiceManager. Don't `new` to get instance of ServiceManager!
     * @returns {ServiceManager}
     */
    static get() {
        if (instance == null) {
            instance = new ServiceManager();
        }
        return instance;
    }

    /**
     * Get service instance by service name
     *
     * @param name {String} - Service name. Eg. `SCHEDULER`
     * @returns {Object} - Required service
     */
    getService(name) {
        switch (name) {
            case ServiceManager.SCHEDULER_SERVICE:
                return this.schedulerService;
                break;
        }
    }
}

module.exports = ServiceManager;
