const Config = require('./Config');
const Bunyan = require('bunyan');
const _ = require('lodash');

let streams = [];
let logLevel = Config.get('performance') ? 'info' : 'debug';
let logConfig = Config.get('Log');

if (logConfig === '' || logConfig === undefined) {
    throw 'Log Configuration missing.';
}

// dynamic logger loader
_.each(logConfig, function (loggerConfig,loggerClass) {
    let logger = require('./loggers/' + loggerClass + 'Logger')(loggerConfig, logLevel);
    if (logger !== undefined) {
        streams.push(logger);
    }
});

let logger = Bunyan.createLogger({
    name: 'mep',
    streams: streams
});

// Deprecated wrapper is available at: http://pastebin.com/aJRfQvAF
module.exports = logger;
