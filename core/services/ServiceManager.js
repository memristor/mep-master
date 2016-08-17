const SchedulerService = require('./scheduler/SchedulerService');

/**
 * Manage services. Start all services and provides instance of required service.
 */
class ServiceManager {
    constructor() {
        // Start all services
        this.schedulerService = new SchedulerService();
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
