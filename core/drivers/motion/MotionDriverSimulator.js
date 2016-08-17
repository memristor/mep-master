const Log = require(__core + 'Log');
const WebSocketServer = require('ws').Server;

const TAG = 'MotionDriverSimulator';

/**
 * MotionDriver simulation module. Has same methods as MotionDriver but
 * this module send all commands to simulator.
 */
class MotionDriverSimulator {
    /**
     * Initialize robot position
     * @param {Int32} x - Start X coordinate
     * @param {Int32} y - Start Y coordinate
     */
    constructor(x, y) {
        var that = this;

        var websocketServer = new WebSocketServer({
            port: 8080
        });

        websocketServer.on('connection', function(ws) {
            that.ws = ws;
            that.opened = true;
            that.sendToSimulator({
                func: 'constructor',
                x: x,
                y: y
            });
        });
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
            Log.debug(TAG, 'Data sended', 1);
        } else {
            Log.error(TAG, 'Server is not opened', 1);
        }
    }
}

module.exports = MotionDriverSimulator;