/**
 * File Logger
 */
const Path = require('path');

function filleLogger(config, logLevel) {
    let fileConfig = {
        active: true,
        outputMode: 'short',
        color: true
    };

    if (config) {
        fileConfig = Object.assign(fileConfig, config);
    }

    if (fileConfig.active === true) {
        let filePath = Path.isAbsolute(fileConfig.file)
            ? fileConfig.file
            : Path.join(__dirname, '/../../../logs', fileConfig.file);

        return {
            level: logLevel,
            type: 'rotating-file',
            path: filePath,
            period: fileConfig.period,
            count: fileConfig.count
        };
    }

    return undefined;
}

module.exports = filleLogger;