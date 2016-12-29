const EventEmitter = require('events').EventEmitter;
const Config = require('./Config');
const net = require('net');

const TAG = 'RobotServer';

class RobotServer extends EventEmitter {
    constructor() {
        super();
        let brainServer = this;

        this.sockets = [];
        this.server = net.createServer((socket) => {
            socket.setEncoding('ascii');
            console.log('Client connected');

            socket.on('data', (data) => {
                let parsedData = JSON.parse(data);

                // Initial message
                if (parsedData.tag === 'Handshake' && parsedData.action === 'init') {
                    brainServer.sockets[parsedData.from] = socket;
                    console.log(TAG, parsedData.from, 'initialized');
                } else {
                    brainServer.emit('packet', parsedData);
                }
            });

            socket.on('connect', () => {
                console.log(TAG, 'Socket connected');
            });
        });

        this.server.listen(Config.BrainServer.port, 'localhost');
    }

    send(packet) {
        if (typeof this.sockets[packet.to] !== 'undefined') {
            this.sockets[packet.to].write(JSON.stringify(packet));
        } else {
            console.error(TAG, 'No client to received message');
        }
    }
}

module.exports = RobotServer;