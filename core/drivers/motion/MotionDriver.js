if (typeof __core == 'undefined') __core = '../../'; // Makes module independent

const MotionDriverBinder = require('bindings')('motion').MotionDriverBinder;
const EventEmiter = require('events');
const Util = require('util');
const Log = require(__core + 'Log');
const Config = require(__core + 'config/Config');
const MotionDriverSimulator = require('./MotionDriverSimulator');

Util.inherits(MotionDriverBinder, EventEmiter);

class MotionDriver extends MotionDriverBinder {
    static get DIRECTION_FORWARD() { return 1; }
    static get DIRECTION_BACKWARD() { return -1; }
}

// Choose what to export, simulation or real hardware
module.exports = (Config.SIMULATION == true) ? MotionDriverSimulator : MotionDriver;
