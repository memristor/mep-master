'use strict';
/** @namespace services.share */

const EventEmitter = require('events').EventEmitter;

const TAG = 'ShareService';

/**
 * Automatically shares position, obstacles and task statuses between robots
 * and provides simple API to share custom messages.
 *
 * @example Mep.Share.send('ROBOT_ARRIVED_TO_POSITION');
 * @example Mep.Share.on('message', (message) => { console.log(message); });
 * @fires services.share.ShareService#message
 * @memberOf services.share
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class ShareService extends EventEmitter {
    init(config) {
        this.config = Object.assign({
            protocol: 'Udp'
        }, config);

        this._onPacketReceived = this._onPacketReceived.bind(this);

        this.communicator = new (require('./protocols/' + this.config.protocol + '.js'))();
        this.communicator.on('packet', this._onPacketReceived);
    }

    _onPacketReceived(packet) {
        // Do something with data
        switch (packet.type) {
            case 'obstacle':
                Mep.Terrain.addObstacle(packet.polygon);
                break;

            case 'message':
                /**
                 * Packet arrived
                 * @event services.share.ShareService#message
                 * @property message {String} - Message from another robot
                 */
                this.emit('message', packet.message);
                break;

            default:
                Mep.Log.warn(TAG, 'Packet type', packet.type, 'is not handled.', packet);
                break;
        }
    }

    send(message) {
        let packet = {
            type: 'message',
            message: message
        };
        this.communicator.send(packet);
    }
}

module.exports = ShareService;