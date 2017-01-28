global.Mep = require('../../Mep');
const MotionDriver = require('./MotionDriverNative');

let motionDriver = new MotionDriver('MotionDriver', {
    startX: 0,
    startY: 0,
    startOrientation: 0,
    startSpeed: 100
});

motionDriver.on('positionChanged', (name, position) => {
    console.log(position);
});
