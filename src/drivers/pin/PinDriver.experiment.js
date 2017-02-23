global.Mep = require('../../Mep');
const Pin = require('./PinDriver');
const CAN = require('../can/CanDriver');

let pin = new Pin('TestLED', {
    id: 2,
    direction: 'output',
    mode: 'digital',
    _communicator: new CAN('CANTest', {})
});

pin.write(1);