const Winston = require('winston');
const WinstonElasticSearch = require('winston-elasticsearch');

let transports = [
    new (Winston.transports.File)({
        level: 'debug',
        timestamp: true,
        filename: __dirname + '/../logs/javascript.log'
    }),
    new (Winston.transports.Console)({
        level: 'debug',
        colorize: true,
        timestamp: true
    }),
    new WinstonElasticSearch({
        // See all options: https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/configuration.html
        level: 'debug',
        timestamp: true,
        clientOpts: {
            host: 'http://127.0.0.1:9200',
            log: {levels: []}
        }
    })
];

const logger = new (Winston.Logger)({
    transports: transports
});

// Deprecated wrapper is available at: http://pastebin.com/aJRfQvAF
module.exports = logger;
