const Point = Mep.require('misc/Point');
const EventEmitter = require('events');

const TAG = 'MotionDriverSimulator';

/**
 * MotionDriverSimulator simulation module. Has same methods as MotionDriver but
 * this module send all commands to simulator.
 * @see MotionDriver
 */
class MotionDriverSimulator extends EventEmitter {
    static get DIRECTION_FORWARD() { return 1; }
    static get DIRECTION_BACKWARD() { return -1; }
    static get STATE_IDLE() { return 1; }
    static get STATE_STUCK() { return 2; }
    static get STATE_MOVING() { return 3; }
    static get STATE_ROTATING() { return 4; }
    static get STATE_ERROR() { return 5; }

    constructor(name, config) {
        super();

        let motionDriverSimulator = this;
        this.name = name;
        this.config = Object.assign({
            startX: -1300,
            startY: 0,
            startOrientation: 0
        }, config);

        this.position = new Point(this.config.startX, this.config.startY);
        this.orientation = this.config.startOrientation;
        this.direction = MotionDriverSimulator.DIRECTION_FORWARD;

        // Position changed
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

        // State changed
        Mep.Telemetry.on(Mep.Telemetry.genOn(TAG, 'stateChanged'), (packet) => {
            motionDriverSimulator.state = packet.params.state;
            Mep.Log.debug(TAG, 'New state', motionDriverSimulator.state);
            motionDriverSimulator.emit('stateChanged', motionDriverSimulator.getState());
        });

        // Orientation changed
        Mep.Telemetry.on(Mep.Telemetry.genOn(TAG, 'orientationChanged'), (packet) => {
            motionDriverSimulator.state = packet.params.state;
            Mep.Log.debug(TAG, 'New state', motionDriverSimulator.state);
            motionDriverSimulator.emit('orientationChanged', motionDriverSimulator.getOrientation());
        });

        Mep.Log.debug(TAG, 'Driver with name', name, 'initialized');
    }

    getState() {
        return this.state;
    }

    getPosition() {
        return this.position;
    }

    getDirection() {
        return this.direction;
    }

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

    stop() {
        Mep.Log.warn(TAG, 'stop() not implemented');
    }

    getOrientation() {
        return this.orientation;
    }

    getGroups() {
        return ['position'];
    }
}

module.exports = MotionDriverSimulator;