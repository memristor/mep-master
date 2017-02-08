'use strict';
/** @namespace drivers.motion */

const Point = Mep.require('misc/Point');
const EventEmitter = require('events');

const TAG = 'MotionDriverSimulator';

/**
 * MotionDriverSimulator simulation module. Has same methods as MotionDriver but
 * this module send all commands to simulator.
 * @see MotionDriver
 * @memberOf drivers.motion
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

        this.name = name;
        this.config = Object.assign({
            startX: -1300,
            startY: 0,
            startOrientation: 0
        }, config);

        this.position = new Point(this.config.startX, this.config.startY);
        this.orientation = this.config.startOrientation;
        this.direction = MotionDriverSimulator.DIRECTION_FORWARD;

        this.onPositionChanged = this.onPositionChanged.bind(this);
        this.onStateChanged = this.onStateChanged.bind(this);
        this.onOrientationChanged = this.onOrientationChanged.bind(this);

        // Events from simulator
        Mep.Telemetry.on(Mep.Telemetry.genOn(TAG, 'positionChanged'), this.onPositionChanged);
        Mep.Telemetry.on(Mep.Telemetry.genOn(TAG, 'stateChanged'), this.onStateChanged);
        Mep.Telemetry.on(Mep.Telemetry.genOn(TAG, 'orientationChanged'), this.onOrientationChanged);

        Mep.Log.debug(TAG, 'Driver with name', name, 'initialized');
    }

    onPositionChanged(packet) {
        this.position.setX(packet.params.x);
        this.position.setY(packet.params.y);
        this.emit(
            'positionChanged',
            this.name,
            this.getPosition(),
            this.config.precision
        );
    }

    onStateChanged(packet) {
        this.state = packet.params.state;
        Mep.Log.debug(TAG, 'New state', this.state);
        this.emit('stateChanged', this.getState());
    }

    onOrientationChanged(packet) {
        this.state = packet.params.state;
        Mep.Log.debug(TAG, 'New state', this.state);
        this.emit('orientationChanged', this.getOrientation());
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

    moveToPosition(position, direction, callback) {
        Mep.Telemetry.send(TAG, 'moveToPosition', {
            x: position.getX(),
            y: position.getY(),
            direction: direction
        });
    }

    finishCommand(callback) {
        Mep.Log.warn(TAG, 'finishCommand() not implemented');
    }

    moveToCurvilinear(position, direction, callback) {
        this.moveToPosition(position, direction, callback);
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