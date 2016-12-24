/**
 * Elasticsearch Telemetry Transmitter
 */
const _ = require('lodash');
const BunyanElasticSearch = require('bunyan-stream-elasticsearch');

function elasticsearchTransmitter(config) {
    let elasticsearchConfig = {
        active: false,
        level: "debug",
        host: "http://localhost:9200",
        indexPattern: "[mep2_telemetry-]YYYY-MM-DD",
        type: "log"
    };

    if (config && !config.indexPattern) {
        elasticsearchConfig.index = "mep2_telemetry";
    }

    if (config) {
        elasticsearchConfig = _.defaults(config, elasticsearchConfig);
    }

    function writeFormatter(entry, input) {
        // change all properties to avoid any elasticsearch type collision between modules
        let values = {};
        let prefix = (entry.tag + '_' + entry.metric).toLowerCase();
        _.each(entry.value, function (v, k) {
            values[prefix + '_' + k] = v;
        });
        // change values
        entry.value = values;
    }

    if (elasticsearchConfig.active === true) {
        return {
            level: 'debug',
            stream: new BunyanElasticSearch({
                index: elasticsearchConfig.index,
                indexPattern: elasticsearchConfig.indexPattern,
                type: elasticsearchConfig.type,
                host: elasticsearchConfig.host,
                writeCallback: writeFormatter
            })
        };
    }

    return undefined;
}

module.exports = elasticsearchTransmitter;