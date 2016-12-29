module.exports = {
    CoreServer: {
        port: 1117,
    },
    DashServer: {
        port: 1116,
        ElasticSearch: {
            host: 'localhost:9200'
        }
    }
};