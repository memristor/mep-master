const MotionDriverBinder = require('bindings')('motion').MotionDriverBinder;
const EventEmiter = require('events');
const Util = require('util');
const MotionDriverConstants = require('./Constants');

Util.inherits(MotionDriverBinder, EventEmiter);

class MotionDriver extends MotionDriverBinder {
    constructor(name, config) {
        super(
            config.startX,
            config.startY
        );

        this.name = name;
    }

    provides() {
        return ['position'];
    }
}

module.exports = MotionDriver;
