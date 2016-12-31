const WebSocket = require('ws').Server;
const EventEmitter = require('events').EventEmitter;
const Config = require('./Config');
const Elasticsearch = require('elasticsearch');
const clc = require('cli-color');

const TAG = 'DashServer';

class DashServer extends EventEmitter {
    constructor() {
        super();

        let dashServer = this;

        // Elasticsearch
        this.esClient = new Elasticsearch.Client({
            host: Config.DashServer.ElasticSearch.host,
            log: 'error'
        });

        // Live communication
        this.sockets = [];
        this.server = new WebSocket({ port: Config.DashServer.port });
        this.server.on('connection', (socket) => {
            console.log(TAG, 'New client is connected!');

            socket.on('message', (data) => {
                try {
                    let parsedData = JSON.parse(data);

                    // Initial message
                    if (parsedData.tag === 'Handshake' && parsedData.action === 'init') {
                        dashServer.sockets[parsedData.from] = socket;
                        console.log(TAG, parsedData.from, 'initialized');
                    } else {
                        dashServer.emit('packet', parsedData);
                    }
                } catch (e) {
                    console.warn(TAG, 'Error parsing packet:', data);
                }
            });
        });
        console.log(TAG + ':', clc.green.bgWhite('localhost:' + Config.DashServer.port));
    }

    send(packet) {
        if (typeof this.sockets['dash:*'] !== 'undefined') {
            try {
                this.sockets['dash:*'].send(JSON.stringify(packet));
            } catch(e) {}
        }

        // Sent to live
        if (typeof this.sockets[packet.to] !== 'undefined') {
            try {
                this.sockets[packet.to].send(JSON.stringify(packet));
            } catch (e) {
                console.error(TAG, 'Error sending packet', e);
            }
        } else {
            console.error(TAG, 'No client to receive message');
        }

        // Send to Elasticsearch
        let body = {
            from: packet.from,
            to: packet.to,
            tag: packet.tag,
            date: packet.date,
            action: packet.action,
        };
        body[packet.from + '_' + packet.tag + '_' + packet.action] = packet.params;

        this.esClient.index({
            index: 'mep2_telemetric-' + (new Date().toJSON().slice(0, 10)),
            type: 'telemetric',
            body: body
        });
    }
}

module.exports = DashServer;