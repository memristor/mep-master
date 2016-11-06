global.Mep = require('../../Mep');
const MotionDriver = require('./MotionDriver');

let motionDriver = new MotionDriver('MotionDriver', Mep.Config.get('Drivers.MotionDriver'));
position = motionDriver.getPosition();
console.log(position);
