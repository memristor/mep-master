const MotionDriverBinder = require('bindings')('motion').MotionDriverBinder;
const EventEmiter = require('events');
const Util = require('util');
const Log = require('../../Log');
const Config = require('../../Config');

Util.inherits(MotionDriverBinder, EventEmiter);

class MotionDriver extends MotionDriverBinder {
    static get DIRECTION_FORWARD() { return 1; }
    static get DIRECTION_BACKWARD() { return -1; }
}
