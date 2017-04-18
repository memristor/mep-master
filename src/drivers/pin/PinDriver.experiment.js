global.Mep = require('../../Mep');
const PinDriver = require('./PinDriver');
const CAN = require('../can/CanDriver');

let ican = new CAN('CANTest', {
    bitrate: 500000
});

let pwmPin = new PinDriver('TestLED', {
    cid: 0x00007F02,
    direction: 'output',
    mode: 'digital',
    _communicator: ican
});
pwmPin.write(1);

/*
let pin = new PinDriver('TestLED', {
    cid: 1015,
    direction: 'output',
    mode: 'digital',
    _communicator: can
});
pin.write(0);
*/


/*
let pinReader = new PinDriver('TestLED', {
    cid: 32768,
    direction: 'input',
    mode: 'digital',
    _communicator: can
});
pinReader.on('changed', (value) => {
    console.log('Pin changed with value', value);
});
*/