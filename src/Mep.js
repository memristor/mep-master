const Config = require('./Config');
const Log = require('./Log');

/**
 * Proxy to custom require(), Log & Config
 * @namespace Mep
 */
var Mep = {
    /**
     * Global function to require library relative to `src` directory
     * @memberof Mep
     * @method require
     * @example
     * const Task = Mep.require('utils/Task');
     *
     * @param {String} library - Path to library
     * @returns {Object} - Required library
     */
    require(library) {
        let allowedDirectories = ['types', 'utils', 'drivers', 'services'];
        let allowedLibraries = ['services/ServiceManager'];

        // Check if it is allowed
        if (allowedLibraries.indexOf(library) >= 0) {
            return require('./' + library);
        }

        // Check if dir is allowed
        var dir = library.split('/')[0];
        if (allowedDirectories.indexOf(dir) < 0) {
            throw new Error('Directory is not allowed');
        }

        // Require lib
        return require('./' + library);
    },

    /**
     * Logging system
     * @see {@link https://github.com/winstonjs/winston|WinstonLogger}
     * @memberof Mep
     * @example
     * Mep.Log.debug('Pathfinding', 'Start path finding for (x, y)');
     *
     * @returns {Log}
     */
    Log: Log,

    /**
     * Access to current configuration
     * @see {@link https://github.com/lorenwest/node-config|NodeConfig}
     * @memberof Mep
     * @example
     * Mep.Config.get('Drivers.MotionDriver.class');
     *
     * @returns {Config}
     */
    Config: Config,

    /**
     * Provides an instance of the PositionService.
     * @memberof Mep
     * @see {@link services.PositionService}
     * @example
     * let position = Mep.getPositionService();
     * position.set(new TunedPoint(100, 100), { speed: 100 });
     *
     * @returns {PositionService}
     */
    getPositionService() {
        return this.positionService;
    },

    /**
     * Provides an instance of the DriverManager.
     * @memberof Mep
     * @see {@link drivers.DriverManager}
     * @example
     * let laserDriver = Mep.getDriverManager().getDriver('LaserDriver');
     *
     * @returns {DriverManager}
     */
    getDriverManager() {
        return this.driverManager;
    },

    /**
     * Initialize necessary modules. Should be called only once during an application bootstrapping
     * @memberof Mep
     */
    init() {
        this.driverManager = new (require('./drivers/DriverManager'))();
        this.positionService =
            new (require('./services/position/PositionService'))(Config.get('Services:PositionService'));
    }
};

module.exports = Mep;
