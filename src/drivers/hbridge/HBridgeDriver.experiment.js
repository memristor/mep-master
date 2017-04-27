global.Mep = require('../../Mep');
const HBridge = require('./HBridgeDriver');
const CAN = require('../can/CanDriver');

let can = new CAN('CANTest', {});



let hbridge = new HBridge('TestHBridge', {
    cid: 1101,
    _communicator: can
});


hbridge.write(150);

setTimeout(() => {
    hbridge.write(0);
}, 1000);

setTimeout(() => {
    hbridge.write(150, true);
}, 2000);

setTimeout(() => {
    hbridge.write(0);
}, 3000);