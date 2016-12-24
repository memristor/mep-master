/**
 * Console Logger
 */
const BunyanFormat = require('bunyan-format');

function consoleLogger(config, logLevel) {
    let consoleConfig = {
        active: true,
        outputMode: 'short',
        color: true
    };

    if (config) {
        consoleConfig = Object.assign(consoleConfig, config);
    }

    if (consoleConfig.active === true) {
        return {
            level: logLevel,
            stream: BunyanFormat({
                outputMode: consoleConfig.outputMode,
                color: consoleConfig.color
            })
        };
    }

    return undefined;
}

module.exports = consoleLogger;