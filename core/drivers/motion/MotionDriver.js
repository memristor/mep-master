if (typeof __base == 'undefined') __base = '../../'; // Makes module independent

const MotionDriverBinder = require('bindings')('motion').MotionDriverBinder;
const EventEmiter = require('events');
const Util = require('util');
const Log = require(__base + 'Log');
const Config = require(__base + 'Config');
const MotionDriverSimulator = require('./MotionDriverSimulator');

Util.inherits(MotionDriverBinder, EventEmiter);

const MotionDirection = {
    FORWARD: 1,
    BACKWARD: -1
};

// Choose what to export, simulation or real hardware
module.exports = {
    MotionDriver: (Config.SIMULATION == true) ? MotionDriverSimulator : MotionDriverBinder,
    MotionDirection
};


// Simulation
var motionDriver = new MotionDriverSimulator(0, 0);
setTimeout(function() {
    motionDriver.moveToPosition(1000, 1000, MotionDirection.BACKWARD);
}, 5000);


