const Config = require('./Config');
const Log = require('./Log');
const dgram = require('dgram');
const EventEmitter = require('events').EventEmitter;

const TAG = 'Telemetry';

class Telemetry extends EventEmitter {
    constructor(config) {
        super();
        let telemetry = this;
        this.active = typeof Config.get('host') !== 'undefined' && Config.get('server') !== '';

        if (this.active === false) return;

        this.serverInfo = Config.get('server').split(':');

        this.client = dgram.createSocket('udp4');
        this.client.bind(config.port, 'localhost');

        this.client.on('message', (data) => {
            try {
                let parsedData = JSON.parse(data);
                telemetry.emit(
                    telemetry.genOn(parsedData.tag, parsedData.action),
                    parsedData
                );
            } catch (e) {
                Log.warn(TAG, 'Error parsing packet:', data);
            }
        });

        Log.info(TAG, 'Connected to server');
        telemetry.send('Handshake', 'init');
    }

    send(tag, action, params) {
        if (this.active === false) return;

        let packet = {
            from: 'core:' + Config.get('robot'),
            to: 'dash:' + Config.get('robot'),
            tag: tag,
            date: new Date(),
            action: action,
            params: params
        };
        let msg = JSON.stringify(packet);
        this.client.send(msg, 0, msg.length, this.serverInfo[1], this.serverInfo[0]);
    }

    genOn(tag, action) {
        return 'data_' + 'dash:big' + '_' + tag + '_' + action;
    }
}

module.exports = Telemetry;
