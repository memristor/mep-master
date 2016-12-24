const Config = require('./Config');
const Bunyan = require('bunyan');

let streams = [];
let logLevel = Config.get('performance') ? 'info' : 'debug';
let logConfig = Config.get('Log');

if (logConfig === '' || logConfig === undefined) {
    throw 'Log Configuration missing.';
}

// Dynamic logger loader
for (let key in logConfig) {
    let logger = require('./misc/loggers/' + key + 'Logger')(logConfig[key], logLevel);
    if (logger !== undefined) {
        streams.push(logger);
    }
}

let logger = Bunyan.createLogger({
    name: 'mep',
    streams: streams
});

module.exports = logger;
