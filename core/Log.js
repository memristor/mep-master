const Winston = require('winston');

/**
 * This class allows advanced message formatting and it is able to print in the file or on the console.
 * @example
 * Log.debug('Pathfinding', 'Path found!', 1);
 */
class Log {
    /**
     * Debug message, regular color.
     * @param {string} TAG - Module name
     * @param {string} message - Message
     */
    static debug(TAG, message) {
        Winston.debug(TAG + ' | ' + message);
    }

    /**
     * Use to report an errors
     * @param {string} TAG - Module name
     * @param {string} message - Message
     */
    static error(TAG, message) {
        Winston.error(TAG + ' | ' + message);
    }

    /**
     * Use to report a warnings
     * @param {string} TAG - Module name
     * @param {string} message - Message
     */
    static warn(TAG, message) {
        Winston.warn(TAG + ' | ' + message);
    }
}

module.exports = Log;
