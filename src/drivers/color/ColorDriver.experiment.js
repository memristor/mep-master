global.Mep = require('../../Mep');
const Color = require('./ColorDriver');
const CAN = require('../can/CanDriver');

let ican = new CAN('CANTest', {});

let color = new Color('test', {
    cid: 1501,
    _communicator: ican
});


color.start(50);

color.on('changed', (color) => {
    console.log('Detected color:', color);
});
