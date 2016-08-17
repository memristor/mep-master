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
     * @param {integer} level - Log level. 1 - LOW, 3 - HIGH
     */
    static debug(TAG, message, level) {
        let out = Log.formatMessage('D', TAG, message);
        console.log(out);
    }

    /**
     * Use to report an errors
     * @param {string} TAG - Module name
     * @param {string} message - Message
     * @param {integer} level - Log level. 1 - LOW, 3 - HIGH
     */
    static error(TAG, message, level) {
        let out = Log.formatMessage('E', TAG, message);
        console.error(out);
    }

    /**
     * Use to report a warnings
     * @param {string} TAG - Module name
     * @param {string} message - Message
     * @param {integer} level - Log level. 1 - LOW, 3 - HIGH
     */
    static warn(TAG, message, level) {
        let out = Log.formatMessage('W', TAG, message);
        console.warn(out);
    }

    static formatTime() {
        let date = new Date();
        return date.getMonth() +  '-' + date.getDay() + ' ' +
            date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + '.' + date.getMilliseconds();
    }

    static formatMessage(symbol, TAG, message) {
        return '[' + symbol + '] | ' + Log.formatTime() + ' | ' + TAG + ' | ' + message;
    }
}

module.exports = Log;