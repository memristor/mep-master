const Config = require('./Config');
const Log = require('./Log');
const dgram = require('dgram');
const EventEmitter = require('events').EventEmitter;

const TAG = 'Telemetry';

class Telemetry extends EventEmitter {
    constructor() {
        super();
        let telemetry = this;

        this.client = dgram.createSocket('udp4');
        this.client.bind(1430, 'localhost');

        this.client.on('message', (data) => {
            let parsedData = JSON.parse(data);
            telemetry.emit(
                telemetry.genOn(parsedData.tag, parsedData.action),
                parsedData
            );
        });

        Log.info(TAG, 'Connected to server');
        telemetry.send('Handshake', 'init', '');
    }

    send(tag, action, params) {
        let packet = {
            from: 'core:big',
            to: 'dash:big',
            tag: tag,
            date: new Date(),
            action: action,
            params: params
        };
        let msg = JSON.stringify(packet);
        this.client.send(msg, 0, msg.length, 1117, 'localhost');
    }

    genOn(tag, action) {
        return 'data_' + 'dash:big' + '_' + tag + '_' + action;
    }
}

module.exports = Telemetry;
