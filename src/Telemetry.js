const Config = require('./Config');
const Log = require('./Log');
const net = require('net');
const EventEmitter = require('events').EventEmitter;

const TAG = 'Telemetry';

class Telemetry extends EventEmitter {
    constructor() {
        super();
        let telemetry = this;

        this.client = net.connect({port: 1117}, () => {
            Log.info(TAG, 'Connected to server');

            telemetry.send('Handshake', 'init', '');
        });

        this.client.on('data', (data) => {
            let parsedData = JSON.parse(data);
            telemetry.emit(
                telemetry.genOn(parsedData.tag, parsedData.action),
                parsedData
            );
        });
    }

    send(tag, action, params) {
        let packet = {
            from: 'core:big',
            to: 'dash:big',
            tag: tag,
            action: action,
            params: params
        };
        this.client.write(JSON.stringify(packet));
    }

    genOn(tag, action) {
        return 'data_' + 'dash:big' + '_' + tag + '_' + action;
    }
}

module.exports = Telemetry;
