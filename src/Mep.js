'use strict';

const Config = require('./Config');
const Log = require('./Log');
const Telemetry = require('./Telemetry');

let telemetry = new Telemetry(Config.get('Telemetry'));

const TAG = 'Mep';

/**
 * Proxy to custom require(), Log, Config, DriverManager & services.
 *
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class Mep {
    /**
     * Global function to require library relative to `src` directory
     * @example
     * const Task = Mep.require('utils/Task');
     *
     * @param {String} library - Path to library
     * @returns {Object} - Required library
     */
    static require(library) {
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
    }


    /**
     * Logging system
     * @see {@link https://www.npmjs.com/package/bunyan|bunyan}
     * @example
     * Mep.Log.debug('Pathfinding', 'Start terrain finding for (x, y)');
     *
     * @returns {Log}
     */
    static get Log() { return Log; }


    /**
     * Telemetry logging system
     * @see {@link Telemetry}
     * @example
     * Mep.Telemetry('PathFinding', 'finding', {x:0.0, y:0.0});
     *
     * @returns {Telemetry}
     */
    static get Telemetry() { return telemetry; }


    /**
     * Access to current configuration
     * @see {@link https://www.npmjs.com/package/nconf|nconf}
     * @memberof Mep
     * @example
     * Mep.Config.get('Drivers.MotionDriver.class');
     *
     * @returns {Config}
     */
    static get Config() { return Config; }


    /**
     * Provides an instance of the PositionService.
     * @see {@link services.position.PositionService}
     * @example
     * Mep.Position.set(new TunedPoint(100, 100), { speed: 100 });
     *
     * @returns {services.position.PositionService}
     */
    static get Position() { return Mep._position; }


    /**
     * Provides an instance of the DriverManager.
     * @see {@link drivers.DriverManager}
     * @example
     * let laserDriver = Mep.DriverManager.getDriver('LaserDriver');
     *
     * @returns {drivers.DriverManager}
     */
    static get DriverManager() { return Mep._driverManager; }

    /**
     * Provides an instance of the Terrain
     * @memberof Mep
     * @see {@link services.terrain.TerrainService}
     * @returns {services.terrain.TerrainService}
     */
    static get Terrain() { return Mep._terrain; }

    /**
     * Provides an instance of the SchedulerService
     * @see {@link services.scheduler.SchedulerService}
     * @example
     * let nextTask = Mep.Scheduler.recommendNextTask();
     *
     * @returns {services.scheduler.SchedulerService}
     */
    static get Scheduler() { return Mep._scheduler; }


    /**
     * Proxy to method `Mep.DriverManager.getDriver(driver)`
     * @example let servo = Mep.getDriver('ArmFirstAX12');
     * @param driver {String} - Driver name
     * @returns {Object} - Instance of required driver
     */
    static getDriver(driver) {
        return this.DriverManager.getDriver(driver);
    }


    /**
     * Reference to motion service
     * @see {@link services.motion.MotionService}
     * @example Mep.Motion.go(new TunedPoint(100, 100));
     * @returns {services.motion.MotionService} - Reference to motion service
     */
    static get Motion() { return Mep._motion; }


    /**
     * Reference to share service
     * @example Mep.Share.send('DOORS_ARE_CLOSED');
     * @example Mep.Share.on('message', (msg) => { console.log(msg); });
     * @see {@link services.share.ShareService}
     * @returns {services.share.ShareService}
     */
    static get Share() { return Mep._share; }

    static isOppositeSide() {
        return (Config.get('table').indexOf('blue') >= 0);
    }

    /**
     * Initialize necessary modules. Should be called only once during an application bootstrapping
     */
    static async init() {
        try {
            Mep._driverManager = new (require('./drivers/DriverManager'))();
            Mep._position = new (require('./services/position/PositionService'))();
            Mep._motion = new (require('./services/motion/MotionService'))();
            Mep._terrain = new (require('./services/terrain/TerrainService'))();
            Mep._scheduler = new (require('./services/scheduler/SchedulerService'))();
            Mep._share = new (require('./services/share/ShareService'))();

            await Mep._driverManager.init();
            Mep._position.init(Config.get('Services:PositionService'));
            Mep._motion.init(Config.get('Services:MotionService'));
            Mep._terrain.init(Config.get('Services:TerrainService'));
            Mep._scheduler.init(Config.get('Services:SchedulerService'));
            Mep._share.init(Config.get('Services:ShareService'));
        } catch (e) {
            Mep.Log.error(TAG, e);
            console.log(e);
        }
    }
}

module.exports = Mep;
