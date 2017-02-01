'use strict';

const Config = require('./Config');
const Log = require('./Log');
const Telemetry = require('./Telemetry');

/**
 * Proxy to custom require(), Log, Config, DriverManager & services.
 *
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 * @namespace Mep
 */
let Mep = {
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
        let allowedDirectories = ['drivers', 'services', 'misc', 'strategy'];
        let allowedLibraries = ['services/ServiceManager'];

        // Check if it is allowed
        if (allowedLibraries.indexOf(library) >= 0) {
            return require('./' + library);
        }

        // Check if dir is allowed
        let dir = library.split('/')[0];
        if (allowedDirectories.indexOf(dir) < 0) {
            throw new Error('Directory is not allowed');
        }

        // Require lib
        return require('./' + library);
    },

    /**
     * Logging system
     * @see {@link https://www.npmjs.com/package/bunyan|bunyan}
     * @memberof Mep
     * @example
     * Mep.Log.debug('Pathfinding', 'Start terrain finding for (x, y)');
     *
     * @returns {Log}
     */
    Log: Log,

    /**
     * Telemetry system
     * @memberof Mep
     * @see {@link Telemetry}
     * @example
     * Mep.Telemetry('PathFinding', 'finding', {x:0.0, y:0.0});
     *
     * @returns {Telemetry}
     */
    Telemetry: (new Telemetry(Config.get('Telemetry'))),

    /**
     * Access to current configuration
     * @see {@link https://www.npmjs.com/package/nconf|nconf}
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
        return this.Position;
    },

    /**
     * Provides an instance of the PathService
     * @memberof Mep
     * @see {@link services.PathService}
     * @returns {PathService}
     */
    getTerrainService() {
        return this.Terrain;
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
        return this.DriverManager;
    },

    /**
     * Provides an instance of the SchedulerService
     * @memberOf Mep
     * @see {@link services.SchedulerService}
     * @example
     * let scheduler = Mep.getSchedulerService();
     *
     * @returns {SchedulerService}
     */
    getSchedulerService() {
        return this.Scheduler;
    },

    /**
     * Initialize necessary modules. Should be called only once during an application bootstrapping
     * @memberof Mep
     */
    init(finishedCallback) {
        let mep = this;

        this.DriverManager = new (require('./drivers/DriverManager'))();

        this.Position =
            new (require('./services/position/PositionService'))();
        this.Terrain = new (require('./services/terrain/TerrainService'))();
        this.Scheduler = new (require('./services/scheduler/SchedulerService'))();

        this.DriverManager.init(() => {
            mep.Position.init(Config.get('Services:PositionService'));
            mep.Terrain.init(Config.get('Services:TerrainService'));
            mep.Scheduler.init(Config.get('Services:SchedulerService'));

            finishedCallback();
        });
    }
};

module.exports = Mep;
