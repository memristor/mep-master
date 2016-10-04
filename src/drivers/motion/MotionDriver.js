const MotionDriverBinder = require('bindings')('motion').MotionDriverBinder;
const EventEmiter = require('events');
const Util = require('util');

Util.inherits(MotionDriverBinder, EventEmiter);

class MotionDriver extends MotionDriverBinder {
    constructor(name, config) {
        super(
            false,
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
