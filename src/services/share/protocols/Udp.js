'use strict';
/** @namespace services.share.protocols */

const EventEmitter = require('events').EventEmitter;
const dgram = require('dgram');

const TAG = 'Udp';

/**
 * Provides sharing based on UDP protocol. Same prototype should be used for other protocols.
 *
 * @memberOf services.share.protocols
 * @fires services.share.protocols.Udp#packet
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class Udp extends EventEmitter {
    constructor(config) {
        super();

        this.config = Object.assign({
            sourcePort: 9001,
            destinationPort: 9001,
            ip: '192.168.255.255',
            broadcast: true
        }, config);

        this._onMessageReceived = this._onMessageReceived.bind(this);
        this._onBind = this._onBind.bind(this);

        // Set up socket
        this.socket = dgram.createSocket('udp4');
        this.socket.bind(this.config.sourcePort, this._onBind);
        this.socket.on('message', this._onMessageReceived);
    }

    _onBind() {
        //this.socket.setBroadcast(true);
    }

    _onMessageReceived(data) {
        try {
            let parsedData = JSON.parse(data.toString());

            /**
             * Packet arrived
             * @event services.share.protocols.Udp#packet
             * @property parsedData {Object} - Received packet
             */
            this.emit(
                'packet',
                parsedData
            );
        } catch (e) {
            Mep.Log.warn(TAG, 'Error parsing packet:', data.toString(), e);
        }
    }

    send(packet) {
        let data = JSON.stringify(packet);
        this.socket.send(data, 0, data.length, this.config.destinationPort, this.config.ip);
    }
}

module.exports = Udp;