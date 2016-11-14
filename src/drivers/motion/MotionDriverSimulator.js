const EventEmitter = require('events');
const WebSocketClient = Mep.require('utils/WebSocketClient');
const Point = Mep.require('types/Point');

const TAG = 'MotionDriverSimulator';

/**
 * MotionDriverSimulator simulation module. Has same methods as MotionDriver but
 * this module send all commands to simulator.
 * @see MotionDriver
 *
 * <pre>
 * Protocol
 * This application (Brain) -> Simulator (Robot):
 * {
 *  to: 'robot:big',
 *  command: 'moveToPosition',
 *  params: {
 *      x: 10,
 *      y: 20
 *  }
 * }
 *
 * Simulator (Robot) -> This application (Brain):
 * {
 *  to: 'brain:big',
 *  event: 'positionChanged',
 *  params: {
 *      x: 10,
 *      y: 20
 *  }
 * }
 * </pre>
 */
class MotionDriverSimulator extends EventEmitter {
    constructor(name, config) {
        super();

        let that = this;
        this._processEventData.bind(this);
        this.name = name;
        this.config = config;

        this.currentPosition = new Point(0, 0);

        // Get a client
        this.ws = WebSocketClient.getInstance();
        this.opened = false;
        this.ws.on('open', () => { that.opened = true; });
        this.ws.on('message', (data) => { that._processEventData(data); });

        Mep.Log.debug(TAG, 'Driver with name', name, 'initialized');
    }

    _processEventData(data) {
        let that = this;
        let eventObject = JSON.parse(data);

        if (eventObject.to !== 'brain:' + Mep.Config.get('robot')) {
            return;
        }

        switch (eventObject.event) {
            case 'positionChanged':
                that.currentPosition.setX(eventObject.params.x);
                that.currentPosition.setY(eventObject.params.y);
                that.emit('positionChanged', that.name, that.getPosition(), that.config.precision);
                break;
        }
    }

    provides() {
        return ['position'];
    }

    getPosition() {
        return this.currentPosition;
    }

    /**
     * Move to absolute position
     * @param {Int32} x - X coordinate
     * @param {Int32} y - Y coordinate
     * @param {MotionDirection} direction - MotionDirection.FORWARD or MotionDirection.BACKWARD
     */
    moveToPosition(x, y, direction) {
        this._sendToSimulator('moveToPosition', {
            x: x,
            y: y,
            direction: direction
        });
    }

    /**
     * Send data to simulator
     * @param {Object} params - Specific set of params for each command
     */
    _sendToSimulator(command, params) {
        this.ws.send(JSON.stringify({
            robot: 'robot:' + Mep.Config.get('robot'),
            command: command,
            params: params
        }));
    }
}

module.exports = MotionDriverSimulator;