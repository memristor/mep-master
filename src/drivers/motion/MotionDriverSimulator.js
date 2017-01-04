const Point = Mep.require('types/Point');
const EventEmitter = require('events');

const TAG = 'MotionDriverSimulator';

/**
 * MotionDriverSimulator simulation module. Has same methods as MotionDriver but
 * this module send all commands to simulator.
 * @see MotionDriver
 */
class MotionDriverSimulator extends EventEmitter {
    constructor(name, config) {
        super();

        let motionDriverSimulator = this;
        this.name = name;
        this.config = config;

        this.position = new Point(this.config.startX, this.config.startY);
        this.orientation = this.config.startOrientation;

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

    getOrientation() {
        return this.orientation;
    }

    getGroups() {
        return ['position'];
    }
}

module.exports = MotionDriverSimulator;