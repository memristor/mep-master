global.Mep = require('../../Mep');
const PinDriver = require('./PinDriver');
const CAN = require('../can/CanDriver');

let can = new CAN('CANTest', {});



let pwmPin = new PinDriver('TestLED', {
    cid: 3000,
    direction: 'output',
    mode: 'analog',
    _communicator: can
});
pwmPin.write(100);

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