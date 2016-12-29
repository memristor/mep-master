const EventEmitter = require('events').EventEmitter;
const Config = require('./Config');
const net = require('net');

const TAG = 'CoreServer';

class CoreServer extends EventEmitter {
    constructor() {
        super();
        let coreServer = this;

        this.sockets = [];
        this.server = net.createServer((socket) => {
            socket.setEncoding('ascii');
            console.log('Client connected');

            socket.on('data', (data) => {
                let dataSets = data.toString().replace('}{', '}|||{').split('|||');

                for (let dataSet of dataSets) {
                    let parsedData = JSON.parse(dataSet);

                    // Initial message
                    if (parsedData.tag === 'Handshake' && parsedData.action === 'init') {
                        coreServer.sockets[parsedData.from] = socket;
                        console.log(TAG, parsedData.from, 'initialized');
                    } else {
                        coreServer.emit('packet', parsedData);
                    }
                }
            });

            socket.on('connect', () => {
                console.log(TAG, 'Socket connected');
            });
        });

        this.server.listen(Config.CoreServer.port, 'localhost');
    }

    send(packet) {
        if (typeof this.sockets[packet.to] !== 'undefined') {
            this.sockets[packet.to].write(JSON.stringify(packet));
        } else {
            console.error(TAG, 'No client to received message');
        }
    }
}

module.exports = CoreServer;