const EventEmitter = require('events').EventEmitter;
const Config = require('./Config');
const dgram = require('dgram');
const clc = require('cli-color');

const TAG = 'CoreServer';

class CoreServer extends EventEmitter {
    constructor() {
        super();
        let coreServer = this;

        this.clients = [];
        this.server = dgram.createSocket('udp4');

        this.server.on('message', (data, client) => {
            try {
                let parsedData = JSON.parse(data);

                // Initial message
                if (parsedData.tag === 'Handshake' && parsedData.action === 'init') {
                    coreServer.clients[parsedData.from] = client;
                    console.log(TAG, parsedData.from, 'initialized');
                } else {
                    coreServer.emit('packet', parsedData);
                }
            } catch (e) {
                console.warn(TAG, 'Error parsing packet:', data);
            }
        });

        this.server.bind(Config.CoreServer.port, '0.0.0.0');
        console.log(TAG + ':', clc.green.bgWhite('localhost:' + Config.CoreServer.port));
    }

    send(packet) {
        if (typeof this.clients[packet.to] !== 'undefined') {
            let msg = JSON.stringify(packet);
            this.server.send(msg, 0, msg.length, this.clients[packet.to].port, this.clients[packet.to].address);
        } else {
            console.error(TAG, 'No client to receive message');
        }
    }
}

module.exports = CoreServer;