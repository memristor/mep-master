const WebSocketClient = Mep.require('utils/WebSocketClient');
const Point = Mep.require('types/Point');
const EventEmitter = require('events');

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

        this.position = new Point(0, 0);

        // Get a client
        this.ws = WebSocketClient.getInstance();
        this.opened = false;
        this.ws.on('open', () => { that.opened = true; });
        this.ws.on('message', (data) => { that._processEventData(data); });

        Mep.Log.debug(TAG, 'Driver with name', name, 'initialized');
    }

    _processEventData(data) {
        let motionDriverSimulator = this;
        let eventObject = JSON.parse(data);

        if (eventObject.to !== 'brain:' + Mep.Config.get('robot')) {
            return;
        }

        switch (eventObject.event) {
            case 'positionChanged':
                motionDriverSimulator.position.setX(eventObject.params.x);
                motionDriverSimulator.position.setY(eventObject.params.y);
                motionDriverSimulator.emit(
                    'positionChanged',
                    motionDriverSimulator.name,
                    motionDriverSimulator.getPosition(),
                    motionDriverSimulator.config.precision
                );
                break;

            case 'stateChanged':
                Mep.Log.debug(TAG, 'New state', motionDriverSimulator.state);
                motionDriverSimulator.state = eventObject.params.state;
                motionDriverSimulator.emit('stateChanged', motionDriverSimulator.getState());
                break;
        }
    }

    getState() {
        return this.state;
    }

    getPosition() {
        return this.position;
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

    setSpeed(speed) {
        Mep.Log.warn(TAG, 'setSpeed() not implemented');
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

    getGroups() {
        return ['position'];
    }
}

module.exports = MotionDriverSimulator;