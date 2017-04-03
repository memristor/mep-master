global.Mep = require('../../Mep');
const HBridge = require('./HBridgeDriver');
const CAN = require('../can/CanDriver');

let can = new CAN('CANTest', {});



let hbridge = new HBridge('TestHBridge', {
    cid: 1101,
    _communicator: can
});


hbridge.start(100);

setTimeout(() => {
    hbridge.stop();
}, 1000);

setTimeout(() => {
    hbridge.start(100, true);
}, 2000);

setTimeout(() => {
    hbridge.stop();
}, 3000);