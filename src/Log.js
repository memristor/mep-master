const Bunyan = require('bunyan');
const BunyanFormat = require('bunyan-format');
const BunyanElasticSearch = require('bunyan-elasticsearch');


let streams = [];

// Add console output
streams.push({
    level: 'debug',
    stream: BunyanFormat({ outputMode: 'short' })
});

// Add file output
streams.push({
    level: 'debug',
    path: __dirname + '/../logs/javascript.log'
});

// Add ElasticSearch
/*
streams.push({
    level: 'error',
    stream: new BunyanElasticSearch({
        indexPattern: '[logstash-]YYYY.MM.DD',
        type: 'logs',
        host: 'localhost:9200'
    })
});
*/

var logger = Bunyan.createLogger({
    name: 'mep',
    streams: streams
});

// Deprecated wrapper is available at: http://pastebin.com/aJRfQvAF
module.exports = logger;
