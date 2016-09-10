const Winston = require('winston');

const logger = new (Winston.Logger)({
    transports: [
        new (Winston.transports.File)({
            level: 'debug',
            filename: __dirname + '/trace.log'
        }),
        new (Winston.transports.Console)({
            level: 'debug',
            colorize: true,
            timestamp: true,
            tailable: true,
        }),

    ]
});

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
        logger.debug(module, message, ...Array.from(arguments).slice(2));
    }

    /**
     * Use to report an errors
     * @param {string} module - Module name
     * @param {string} message - Message
     */
    static error(module, message) {
        logger.error(module, message, ...Array.from(arguments).slice(2));
    }

    /**
     * Use to report an info
     * @param {string} module - Module name
     * @param {string} message - Message
     */
    static info(module, message) {
        logger.info(module, message, ...Array.from(arguments).slice(2));
    }

    /**
     * Use to report a warnings
     * @param {string} module - Module name
     * @param {string} message - Message
     */
    static warn(module, message) {
        logger.warn(module, message, ...Array.from(arguments).slice(2));
    }
}

module.exports = Log;
