console.info('Run experiment using:');
console.info('node --harmony-async-await AX12Driver.experiment.js');
console.info('');

global.Mep = require('../../Mep');
const AX12 = require('./AX12Driver');
const CAN = require('../can/CanDriver');

let ax = new AX12('test', {
    id: 2,
    _communicator: new CAN('CANTest', {})
});

//ax.go(0, { timeout: 3000, firmwareImplementation: false });

//ax.setCWAngleLimit(0);
//ax.setCCWAngleLimit(0);

ax.setSpeed(0);
//ax.setPosition(100);
setInterval(() => { ax.getStatus().then((status) => { console.log(status); }); }, 500);

//setInterval(() => { ax.getTemperature().then((temperature) => { console.log('Temperature:', temperature); }) }, 300);

//ax.setId(2);
//ax.setLED(true);

//ax.getFirmwareVersion();