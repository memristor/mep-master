'use strict';
/** @namespace services.share */

const EventEmitter = require('events').EventEmitter;
const Polygon = Mep.require('misc/Polygon');
const Point = Mep.require('misc/Point');

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
            protocol: 'Udp',
            position: true
        }, config);

        this._lastFriendPosition = null;

        this._onPacketReceived = this._onPacketReceived.bind(this);
        this._onObstacleDetected = this._onObstacleDetected.bind(this);
        this._onPositionChanged = this._onPositionChanged.bind(this);

        this.communicator = new (require('./protocols/' + this.config.protocol + '.js'))({
            ip: Mep.Config.get('friendIp')
        });
        this.communicator.on('packet', this._onPacketReceived);

        // Mep.Terrain.on('obstacleDetected', this._onObstacleDetected);
        if (this.config.position === true) {
            Mep.Position.on('positionChanged', this._onPositionChanged);
        }
    }

    getLastFriendPosition() {
        return this._lastFriendPosition;
    }

    _onObstacleDetected(params) {
        params.polygon.setTag('Friend:' + params.polygon.getTag());

        let packet = {
            type: 'obstacle',
            poi: params.poi,
            polygon: params.polygon
        };
        this.communicator.send(packet);
    }

    _onPositionChanged(json) {
        let point = new Point(json.x, json.y);
        this._lastFriendPosition = point;

        let padding = ((Mep.Config.get('volume') / 4) / 2) * 1.5;
        let polyPoints = [
            new Point(point.getX() - padding, point.getY() - padding),
            new Point(point.getY() + padding, point.getY() - padding),
            new Point(point.getY() + padding, point.getY() + padding),
            new Point(point.getY() - padding, point.getY() + padding),
        ];

        let polygon = new Polygon(
            'Friend:' + TAG,
            Mep.Config.get('obstacleMaxPeriod'),
            polyPoints
        );

        let packet = {
            type: 'obstacle',
            poi: point,
            polygon: polygon
        };
        this.communicator.send(packet);
    }

    _onPacketReceived(packet) {
        Mep.Log.debug(TAG, packet);

        // Do something with data
        switch (packet.type) {
            case 'obstacle':
                let polyPoints = [];
                for (let json of packet.polygon.points) {
                    polyPoints.push(new Point(json.x, json.y));
                }

                Mep.Terrain.addObstacle(
                    new Polygon(packet.polygon.tag,
                        packet.polygon.duration,
                        polyPoints)
                );
                break;

            case 'message':
                /**
                 * Packet arrived
                 * @event services.share.ShareService#message
                 * @property {String} message Message from another robot
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