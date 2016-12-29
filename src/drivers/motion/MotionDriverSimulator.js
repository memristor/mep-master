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

        let motionDriverSimulator = this;
        this.name = name;
        this.config = config;

        this.position = new Point(0, 0);


        Mep.Telemetry.on(Mep.Telemetry.genOn(TAG, 'positionChanged'), (packet) => {
            motionDriverSimulator.position.setX(packet.params.x);
            motionDriverSimulator.position.setY(packet.params.y);
            motionDriverSimulator.emit(
                'positionChanged',
                motionDriverSimulator.name,
                motionDriverSimulator.getPosition(),
                motionDriverSimulator.config.precision
            );
        });

        // StateChanged
        Mep.Telemetry.on(Mep.Telemetry.genOn(TAG, 'stateChanged'), (packet) => {
            Mep.Log.debug(TAG, 'New state', motionDriverSimulator.state);
            motionDriverSimulator.state = packet.params.state;
            motionDriverSimulator.emit('stateChanged', motionDriverSimulator.getState());
        });

        Mep.Log.debug(TAG, 'Driver with name', name, 'initialized');
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
        Mep.Telemetry.send(TAG, 'moveToPosition', {
            x: x,
            y: y,
            direction: direction
        });
    }

    setSpeed(speed) {
        Mep.Log.warn(TAG, 'setSpeed() not implemented');
    }

    getGroups() {
        return ['position'];
    }
}

module.exports = MotionDriverSimulator;