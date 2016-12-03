const Path = require('path');
const Config = require('./Config');
const Bunyan = require('bunyan');
const BunyanFormat = require('bunyan-format');
const BunyanElasticSearch = require('bunyan-elasticsearch');


let streams = [];

// Add console output
streams.push({
    level: Config.get('performance') ? 'info' : 'debug',
    stream: BunyanFormat({ outputMode: 'short' })
});

// Add file output
streams.push({
    level: Config.get('performance') ? 'info' : 'debug',
    type: 'rotating-file',
    path: Path.join(__dirname, '/../logs/javascript.log'),
    period: '1d',
    count: 3
});

// Add ElasticSearch
if (Config.get('elasticHost') !== '' &&
    typeof Config.get('elasticHost') !== 'undefined') {
    streams.push({
        level: 'debug',
        stream: new BunyanElasticSearch({
            indexPattern: '[logstash-]YYYY.MM.DD',
            type: 'logs',
            host: Config.get('elasticHost')
        })
    });
}

var logger = Bunyan.createLogger({
    name: 'mep',
    streams: streams
});

// Deprecated wrapper is available at: http://pastebin.com/aJRfQvAF
module.exports = logger;
