const Winston = require('winston');

/**
 * This class allows advanced message formatting and it is able to print in the file or on the console.
 * @example
 * Mep.Log.debug('Pathfinding', 'Path found!');
 */
class Log {
    /**
     * Debug message, regular color.
     * @param {string} module - Module name
     * @param {string} message - Message
     */
    static debug(module, message) {
        Winston.debug(module + ' | ' + message);
    }

    /**
     * Use to report an errors
     * @param {string} module - Module name
     * @param {string} message - Message
     */
    static error(module, message) {
        Winston.error(module + ' | ' + message);
    }

    /**
     * Use to report a warnings
     * @param {string} module - Module name
     * @param {string} message - Message
     */
    static warn(module, message) {
        Winston.warn(module + ' | ' + message);
    }
}

module.exports = Log;
