const MotionDriver = require('./motion/MotionDriver');

const Constants = {
    MOTION_DRIVER: 'MOTION_DRIVER',
};

var driverManager = null;

/**
 * Manage services. Start all services and provides instance of required service.
 * Singleton class.
 */
class DriverManager {
    constructor() {
        this.motionDriver = new MotionDriver.MotionDriver();
    }

    /**
     * Get ServiceManager instance
     * @returns {ServiceManager} - ServiceManager instance
     */
    static getInstance() {
        if (driverManager == null) {
            driverManager = new DriverManager();
        }
        return driverManager;
    }

    /**
     * Get service instance by service name
     *
     * @param name {String} - Service name. Eg. `SCHEDULER`
     * @returns {Object} - Required service
     */
    getDriver(name) {
        switch (name) {
            case Constants.MOTION_DRIVER:
                return this.schedulerService;
                break;
        }
    }
}

module.exports = DriverManager;
