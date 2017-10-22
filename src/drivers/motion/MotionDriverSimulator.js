'use strict';
/** @namespace drivers.motion */

const Point = Mep.require("misc/geometry/Point");
const EventEmitter = require('events');
const TaskError = Mep.require('strategy/TaskError');
const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');

const TAG = 'MotionDriverSimulator';

/**
 * MotionDriverSimulator simulation module. Has same methods as MotionDriver but
 * this module send all commands to simulator.
 * @see MotionDriver
 * @memberOf drivers.motion
 */
class MotionDriverSimulator extends EventEmitter {
    static get STATE_IDLE() { return 'I'.charCodeAt(0); }
    static get STATE_STUCK() { return 'S'.charCodeAt(0); }
    static get STATE_MOVING() { return 'M'.charCodeAt(0); }
    static get STATE_ROTATING() { return 'R'.charCodeAt(0); }
    static get STATE_ERROR() { return 'E'.charCodeAt(0); }
    static get STATE_BREAK() { return 'B'.charCodeAt(0); }
    static get STATE_UNDEFINED() { return 'U'.charCodeAt(0); }

    static get DIRECTION_FORWARD() { return 1; }
    static get DIRECTION_UNDEFINED() { return 0; }
    static get DIRECTION_BACKWARD() { return -1; }

    constructor(name, config) {
        super();

        this.name = name;
        this.config = Object.assign({
            startX: -1300,
            startY: 0,
            startOrientation: 0
        }, config);

        this.position = new TunedPoint(...this.config.startPosition).getPoint();
        this.orientation = new TunedAngle(...this.config.startOrientation).getAngle();
        this.direction = MotionDriverSimulator.DIRECTION_FORWARD;

        this.setPositionAndOrientation(
            this.position.getX(),
            this.position.getY(),
            this.orientation
        );

        this.onPositionChanged = this.onPositionChanged.bind(this);
        this.onStateChanged = this.onStateChanged.bind(this);
        this.onOrientationChanged = this.onOrientationChanged.bind(this);

        // Events from simulator
        Mep.Telemetry.on(Mep.Telemetry.genOn(TAG, 'positionChanged'), this.onPositionChanged);
        Mep.Telemetry.on(Mep.Telemetry.genOn(TAG, 'stateChanged'), this.onStateChanged);
        Mep.Telemetry.on(Mep.Telemetry.genOn(TAG, 'orientationChanged'), this.onOrientationChanged);

        Mep.Log.debug(TAG, 'Driver with name', name, 'initialized');
    }

    setPositionAndOrientation(x, y, orientation) {
        Mep.Telemetry.send(TAG, 'setPositionAndOrientation', {
            x: x,
            y: y,
            orientation: orientation
        });
    }

    goForward(millimeters) {
        let point = new Point(millimeters, 0);
        let direction = (millimeters < 0) ? -1 : 1;

        point.rotateAroundZero(Mep.Position.getOrientation());
        point.translate(Mep.Position.getPosition());

        this.moveToPosition(point, direction);
    }

    _promiseToStateChanged() {
        let motionDriver = this;

        return new Promise((resolve, reject) => {
            let stateListener = (name, state) => {
                switch (state) {
                    case MotionDriverSimulator.STATE_IDLE:
                        resolve();
                        motionDriver.removeListener('stateChanged', stateListener);
                        break;
                    case MotionDriverSimulator.STATE_STUCK:
                        reject(new TaskError(TAG, 'stuck', 'Robot is stacked'));
                        motionDriver.removeListener('stateChanged', stateListener);
                        break;
                    case MotionDriverSimulator.STATE_ERROR:
                        reject(new TaskError(TAG, 'error', 'Unknown moving error'));
                        motionDriver.removeListener('stateChanged', stateListener);
                        break;
                    case MotionDriverSimulator.STATE_BREAK:
                        reject(new TaskError(TAG, 'break', 'Command is broken by another one'));
                        motionDriver.removeListener('stateChanged', stateListener);
                        break;
                }
            };
            this.on('stateChanged', stateListener);
        });
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
        this.state = packet.params.state | 0;
        Mep.Log.debug(TAG, 'New state', this.state);
        this.emit('stateChanged', this.name, this.getState());
    }

    onOrientationChanged(packet) {
        this.orientation = packet.params.orientation;
        Mep.Log.debug(TAG, 'New orientation', this.orientation);
        this.emit('orientationChanged', this.name, this.getOrientation());
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

    moveToPosition(position, direction) {
        Mep.Telemetry.send(TAG, 'moveToPosition', {
            x: position.getX(),
            y: position.getY(),
            direction: direction
        });
        return this._promiseToStateChanged();
    }

    finishCommand() {
        Mep.Log.warn(TAG, 'finishCommand() not implemented');
    }

    moveToCurvilinear(position, direction, callback) {
        return this.moveToPosition(position, direction, callback);
    }

    setSpeed(speed) {
        Mep.Log.warn(TAG, 'setSpeed() not implemented');
    }

    stop() {
        Mep.Log.warn(TAG, 'stop() not implemented');
    }

    rotateTo() {
        Mep.Log.warn(TAG, 'rotateTo() not implemented');
        return new Promise((resolve, reject) => {
            setTimeout(resolve, 100);
        });
    }

    getOrientation() {
        return this.orientation;
    }

    getGroups() {
        return ['position'];
    }

    getActiveSpeed() {
        return 100;
    }
}

module.exports = MotionDriverSimulator;