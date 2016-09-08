const Log = require('./Log');
const Config = require('./Config');

/**
 * Proxy to custom require(), Log & Config
 * @namespace Mep
 */
var Mep = {
    /**
     * Global function to require library relative to `core` directory
     * @memberof Mep
     * @method require
     * @example
     * const Task = Mep.require('utils/Task');
     *
     * @param {String} library - Path to library
     * @returns {Object} - Required library
     */
    require(library) {
        let allowedDirectories = ['types', 'utils'];
        let allowedLibraries = ['services/ServiceManager', 'drivers/DriverManager'];

        // Check if it is allowed
        if (allowedLibraries.indexOf(library) >= 0) {
            return require('./' + library);
        }

        // Check if root
        if (library.indexOf('/') < 0) {
            throw new Error('Library can\'t be in root');
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
     * @see Log
     * @memberof Mep
     * @example
     * Mep.Log.debug('Pathfinding', 'Start path finding for (x, y)');
     *
     * @returns {Log}
     */
    Log: Log,

    /**
     * Access to current configuration
     * @memberof Mep
     * @example
     * Mep.Config.get('Drivers.MotionDriver.class');
     *
     * @returns {Config}
     */
    Config: Config
};

module.exports = Mep;