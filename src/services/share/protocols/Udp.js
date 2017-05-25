'use strict';
/** @namespace services.share.protocols */

const EventEmitter = require('events').EventEmitter;
const dgram = require('dgram');
const os = require("os");
const hostname = os.hostname();
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
            broadcast: true,
            // multicast ip address and port
            multicastServerIp: '224.1.1.1',
            // ip listening to multicast flow, 0.0.0.0 === any ip address on your pc
            multicastPort: 9001
        }, config);

        let self = this;

        this._onMessageReceived = this._onMessageReceived.bind(this);
        this._onBind = this._onBind.bind(this);

        Promise.all([
            self.initMulticastServer(),
            self.initMulticastClient()
        ])
            .then(function () {
                Mep.Log.info(TAG, 'multicast server and client online');
            });
    }

    /**
     * Init multicast UDP server listening to anything
     */
    initMulticastServer() {
        this.server = dgram.createSocket({type: "udp4", reuseAddr: true});
        let self = this;
        return new Promise(function (success) {
            self.server.bind(self.config.multicastPort, function () {
                self.server.setBroadcast(true);
                self.server.setMulticastTTL(128);
                self.server.addMembership(self.config.multicastServerIp);
                success();
            });
        });
    }

    send(packet) {
        this.sendMulticast(packet);
    }

    sendMulticast(packet) {
        // format a packet with hostname to be able to filter on receive message (since both robots will chat on same channel)
        let formatedPacket = {
            origin: hostname,
            data: packet
        };
        let data = JSON.stringify(formatedPacket);
        this.server.send(data, 0, data.length, this.config.multicastPort, this.config.multicastServerIp);
    }

    initMulticastClient() {
        // important : use reuseAddr to allow a client and server on a multicast on same port on same pc
        let client = dgram.createSocket({type: "udp4", reuseAddr: true});
        let self = this;

        return new Promise(function (success) {
            client.on('listening', function () {
                let address = client.address();
                Mep.Log.info(TAG, 'UDP Client listening on ' + address.address + ":" + address.port);
                client.setBroadcast(true);
                client.setMulticastTTL(128);
                client.addMembership(self.config.multicastServerIp);
                success();
            });

            client.on('error', (err) => {
                Mep.Log.error(TAG, `server error:\n${err.stack}`);
                //client.close();
            });

            client.on('message', function (message, remote) {
                self._onMessageReceived(message);
            });

            // server listening 0.0.0.0:multicastPort
            client.bind(self.config.multicastPort);
        });
    }

    _onBind() {
        this.socket.setBroadcast(true);
    }

    _onMessageReceived(data) {
        try {
            let parsedData = JSON.parse(data.toString());

            if (parsedData.origin) {
                if (parsedData.origin === hostname) {
                    Mep.Log.debug(TAG, 'Filter packet from same origin:', data.toString());
                    return;
                }
                parsedData = parsedData.data;
            }
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

}

module.exports = Udp;