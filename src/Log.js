const Config = require('./Config');
const Bunyan = require('bunyan');
const BunyanFormat = require('bunyan-format');

let streams = [];
let logLevel = Config.get('performance') ? 'info' : 'debug';
let logConfig = Config.get('Log');

if (logConfig === '' || logConfig === undefined) {
    throw 'Log Configuration missing.';
}

// Add console output
if (logConfig.Console !== undefined && logConfig.Console.active === true) {
    streams.push({
        level: logLevel,
        stream: BunyanFormat({
            outputMode: logConfig.Console.outputMode,
            color: logConfig.Console.color
        })
    });
}

// Add file output
if (logConfig.File !== undefined && logConfig.File.active === true) {
    streams.push({
        level: logLevel,
        type: 'rotating-file',
        path: Path.join(__dirname, '/../logs/' + logConfig.File.file),
        period: logConfig.File.period,
        count: logConfig.File.count
    });
}

let logger = Bunyan.createLogger({
    name: 'mep',
    streams: streams
});

module.exports = logger;
