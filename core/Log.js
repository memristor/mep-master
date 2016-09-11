const Winston = require('winston');

const logger = new (Winston.Logger)({
    transports: [
        new (Winston.transports.File)({
            level: 'debug',
            filename: __dirname + '/../trace.log'
        }),
        new (Winston.transports.Console)({
            level: 'debug',
            colorize: true,
            timestamp: true
        }),
    ]
});

// Deprecated wrapper is available at: http://pastebin.com/aJRfQvAF
module.exports = logger;
