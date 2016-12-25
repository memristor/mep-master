/**
 * Elasticsearch Telemetry Transmitter
 */
const BunyanElasticSearch = require('bunyan-stream-elasticsearch');
const Config = require('../../Config');

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
        elasticsearchConfig = Object.assign(elasticsearchConfig, config);
    }

    function writeFormatter(entry, input) {
        // Change all properties to avoid any elasticsearch type collision between modules
        let values = {};
        let prefix = (entry.tag + '_' + entry.metric).toLowerCase();

        for (let key in entry.value) {
            values[prefix + '_' + key] = entry.value[key];
        }

        // Change values
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