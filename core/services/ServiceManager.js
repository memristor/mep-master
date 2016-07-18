const SchedulerService = require('./scheduler/SchedulerService');

var serviceManager = null;

/**
 * Manage services. Start all services and provides instance of required service.
 * Singleton class.
 */
class ServiceManager {
    constructor() {
        // Start all services
        this.schedulerService = new SchedulerService();
    }

    /**
     * Get ServiceManager instance
     * @returns {ServiceManager} - ServiceManager instance
     */
    static getInstance() {
        if (serviceManager == null) {
            serviceManager = new ServiceManager();
        }
        return serviceManager;
    }

    /**
     * Get service instance by service name
     *
     * @param name {String} - Service name. Eg. `SCHEDULER`
     * @returns {Object} - Required service
     */
    getService(name) {
        switch (name) {
            case 'SCHEDULER':
                return this.schedulerService;
                break;
        }
    }
}

module.exports = ServiceManager;
