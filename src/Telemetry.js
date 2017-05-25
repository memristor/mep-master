const Config = require('./Config');
const Log = require('./Log');
const dgram = require('dgram');
const EventEmitter = require('events').EventEmitter;

const TAG = 'Telemetry';

/**
 * Enables communication between `mep-master` and `mep-dash`.
 *
 * @fires Telemetry#data_[from]_[tag]_[action]
 */
class Telemetry extends EventEmitter {
    constructor(config) {
        super();
        let telemetry = this;
        this.active = typeof Config.get('host') !== 'undefined' && Config.get('server') !== '';

        if (this.active === false) return;

        this.serverInfo = Config.get('server').split(':');

        this.client = dgram.createSocket('udp4');
        this.client.bind(config.port, '0.0.0.0');

        this.client.on('message', (data) => {
            try {
                let parsedData = JSON.parse(data.toString());

                /**
                 * Packet arrived
                 * @event Telemetry#data_[from]_[tag]_[action]
                 * @property parsedData {Object} - Received packet
                 */
                telemetry.emit(
                    telemetry.genOn(parsedData.tag, parsedData.action),
                    parsedData
                );
            } catch (e) {
                Log.warn(TAG, 'Error parsing packet:', data.toString());
            }
        });

        Log.info(TAG, 'Connected to server');
        telemetry.send('Handshake', 'init');
    }

    /**
     * Send log or command to mep-dash.
     * @param tag {String} - Message tag
     * @param action {String} - Message action
     * @param params {Object} - Additional parameters of interest to action
     */
    send(tag, action, params) {
        if (this.active === false) return;

        let packet = {
            from: 'core:big', // + Config.get('robot'),
            to: 'dash:big', // + Config.get('robot'),
            tag: tag,
            //date: new Date(),
            action: action,
            params: params
        };
        let msg = JSON.stringify(packet);
        this.client.send(msg, 0, msg.length, this.serverInfo[1], this.serverInfo[0]);
    }

    /**
     * Helper that generates query string for .on()
     * @param tag {String} - Message tag
     * @param action {String} - Message action
     * @return {string} - Generated query string for .on()
     */
    genOn(tag, action) {
        return 'data_' + 'dash:big' + '_' + tag + '_' + action;
    }
}

module.exports = Telemetry;
