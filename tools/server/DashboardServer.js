const WebSocket = require('ws').Server;
const EventEmitter = require('events').EventEmitter;
const Config = require('./Config');
const Elasticsearch = require('elasticsearch');


const TAG = 'DashboardServer';

class DashboardServer extends EventEmitter {
    constructor() {
        super();

        let dashboardServer = this;

        // Elasticsearch
        this.esClient = new Elasticsearch.Client({
            host: 'localhost:9200',
            log: 'error'
        });

        // Live communication
        this.sockets = [];
        this.server = new WebSocket({ port: Config.DashboardServer.port });
        this.server.on('connection', (socket) => {
            console.log(TAG, 'New client is connected!');

            socket.on('message', (data) => {
                let parsedData = JSON.parse(data);

                // Initial message
                if (parsedData.tag === 'Handshake' && parsedData.action === 'init') {
                    dashboardServer.sockets[parsedData.from] = socket;
                    console.log(TAG, parsedData.from, 'initialized');
                } else {
                    dashboardServer.emit('packet', parsedData);
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

module.exports = DashboardServer;