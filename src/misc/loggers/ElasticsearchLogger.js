/**
 * Elasticsearch Logger
 */
const BunyanElasticSearch = require('bunyan-stream-elasticsearch');
const Config = require('../../Config');

function elasticsearchLogger(config, logLevel) {
    let elasticsearchConfig = {
        active: false,
        level: "debug",
        host: "http://localhost:9200",
        indexPattern: "[mep2_logs-]YYYY-MM-DD",
        type: "log"
    };

    if (config && !config.indexPattern) {
        elasticsearchConfig.index = "mep2_logs";
    }

    if (config) {
        elasticsearchConfig = Object.assign(elasticsearchConfig, config);
    }

    if (elasticsearchConfig.active === true) {
        return {
            level: logLevel,
            stream: new BunyanElasticSearch({
                index: elasticsearchConfig.index,
                indexPattern: elasticsearchConfig.indexPattern,
                type: elasticsearchConfig.type,
                host: elasticsearchConfig.host
            })
        };
    }

    return undefined;
}

module.exports = elasticsearchLogger;