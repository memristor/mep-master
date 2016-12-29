const WebSocket = require('ws').Server;
const EventEmitter = require('events').EventEmitter;
const Config = require('./Config');
const Elasticsearch = require('elasticsearch');


const TAG = 'DashServer';

class DashServer extends EventEmitter {
    constructor() {
        super();

        let dashServer = this;

        // Elasticsearch
        this.esClient = new Elasticsearch.Client({
            host: 'localhost:9200',
            log: 'error'
        });

        // Live communication
        this.sockets = [];
        this.server = new WebSocket({ port: Config.DashServer.port });
        this.server.on('connection', (socket) => {
            console.log(TAG, 'New client is connected!');

            socket.on('message', (data) => {
                let parsedData = JSON.parse(data);

                // Initial message
                if (parsedData.tag === 'Handshake' && parsedData.action === 'init') {
                    dashServer.sockets[parsedData.from] = socket;
                    console.log(TAG, parsedData.from, 'initialized');
                } else {
                    dashServer.emit('packet', parsedData);
                }
            });
        });
    }

    send(packet) {
        // Sent to live
        if (typeof this.sockets[packet.to] !== 'undefined') {
            this.sockets[packet.to].send(JSON.stringify(packet));
        } else {
            console.error(TAG, 'No client to received message');
        }

        // Send to Elasticsearch
        packet['@timestamp'] = Date.now();
        this.esClient.index({
            index: 'mep2_telemetric-2016-12-28',
            type: 'telemetric',
            body: packet
        });
    }
}

module.exports = DashServer;