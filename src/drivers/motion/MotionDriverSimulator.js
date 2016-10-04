const WebSocketServer = require('ws').Server;
const EventEmitter = require('events');

const TAG = 'MotionDriverSimulator';

/**
 * MotionDriver simulation module. Has same methods as MotionDriver but
 * this module send all commands to simulator.
 */
class MotionDriverSimulator extends EventEmitter {
    /**
     * Initialize robot position
     * @param {Int32} x - Start X coordinate
     * @param {Int32} y - Start Y coordinate
     */
    constructor(name, config) {
        super();

        var that = this;

        var websocketServer = new WebSocketServer({
            port: 8080
        });

        websocketServer.on('connection', function (ws) {
            that.ws = ws;
            that.opened = true;
            that.sendToSimulator({
                func: 'constructor',
                x: config.startX,
                y: config.startY
            });
        });

        this.name = name;

        Mep.Log.debug(TAG, 'Driver with name', name, 'initialized');
    }

    provides() {
        return ['position'];
    }

    /**
     * Move to absolute position
     * @param {Int32} x - X coordinate
     * @param {Int32} y - Y coordinate
     * @param {MotionDirection} direction - MotionDirection.FORWARD or MotionDirection.BACKWARD
     */
    moveToPosition(x, y, direction) {
        this.sendToSimulator({
            func: 'moveToPosition',
            x: x,
            y: y,
            direction: direction
        });
    }

    /**
     * Send data to simulator
     * @param {Object} params - Specific set of params for each command
     */
    sendToSimulator(params) {
        if (this.opened == true) {
            this.ws.send(JSON.stringify({
                source: 'motion',
                robot: 'big',
                params: params
            }));
            Mep.Log.debug(TAG, 'Data sent');
        } else {
            Mep.Log.error(TAG, 'Server is not opened');
        }
    }
}

module.exports = MotionDriverSimulator;