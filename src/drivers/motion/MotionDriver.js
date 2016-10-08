const MotionDriverBinder = require('bindings')('motion').MotionDriverBinder;
const EventEmiter = require('events');
const Util = require('util');
const Point = Mep.require('types/Point');

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

    getPosition() {
        let position = super.getPosition();
        return (new Point(position[0], position[1]));
    }

    provides() {
        return ['position'];
    }
}

module.exports = MotionDriver;
