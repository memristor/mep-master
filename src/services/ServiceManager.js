/** @namespace services */

const ModuleLoader = Mep.require('utils/ModuleLoader');

var instance = null;

/**
 * Manage services. Starts all services and provides instance of required service.
 *
 * <p>CONSIDER: DriverManager is great thing, therefor I am not sure about Service Manager.
 * I am not sure do we really need it and what is benefit of having it. In the future
 * we should consider ServiceManager's existence.</p>
 * @memberof services
 */
class ServiceManager {
    /**
     * @private
     */
    constructor() {
        if (instance != null) {
            throw new Error('ServiceManager is not meant to be initialized');
        }

        // Services initialization
        this.services = ModuleLoader.load(
            Mep.Config.get('Services'),
            false
        );
    }

    /**
     * Get instance of ServiceManager. Do not use `new` to get instance of ServiceManager!
     * @returns {ServiceManager}
     */
    static get() {
        if (instance == null) {
            instance = new ServiceManager();
        }
        return instance;
    }

    getPositionService() {
        return this.services['PositionService'];
    }
}

module.exports = ServiceManager;
