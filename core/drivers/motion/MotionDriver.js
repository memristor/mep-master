const MotionDriverBinder = require('bindings')('motion').MotionDriverBinder;
const EventEmiter = require('events');
const Util = require('util');

Util.inherits(MotionDriverBinder, EventEmiter);

class MotionDriver extends MotionDriverBinder {
    static get DIRECTION_FORWARD() { return 1; }
    static get DIRECTION_BACKWARD() { return -1; }

    constructor() {
        super(
            Mep.Config.get('Drivers.MotionDriver.startX'),
            Mep.Config.get('Drivers.MotionDriver.startY')
        );
    }
}

module.exports = MotionDriver;