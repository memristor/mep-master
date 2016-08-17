const Robot = require('bindings')('Robot').Robot;
const EventEmiter = require('events');
const Util = require('util');

Util.inherits(Robot, EventEmiter);

var robot = new Robot();
robot.on('positionChanged', function(e) { console.log('positionChanged() ' + e); });
robot.setX(3);
console.log(robot.getX());

var robot2 = new Robot();
console.log(robot2.getX());




// EventEmiter test
/*
class Test extends EventEmiter {
	constructor() {
		super();
		
		var that = this;
		setTimeout(function() {
			that.emit('test', 5)
		}, 100);
	}
}

var t = new Test();
t.on('test', function(a) { console.log(a) });
*/