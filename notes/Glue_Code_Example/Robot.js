const Robot = require('bindings')('Robot').Robot;
const EventEmiter = require('events');
const Util = require('util');

Util.inherits(Robot, EventEmiter);

var robot = new Robot();

console.log(new Date(), "JavaScript Interplay");
console.log(robot.getX());
console.log(new Date(), "JavaScript");



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