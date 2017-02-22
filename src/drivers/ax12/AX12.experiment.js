global.Mep = require('../../Mep');
const AX12 = require('./AX12');
const CAN = require('../can/CanDriver');

let ax = new AX12('test', {
    id: 2,
    _communicator: new CAN('CANTest', {})
});

//ax.go(0, { timeout: 3000, firmwareImplementation: false });

//ax.setCWAngleLimit(0);
//ax.setCCWAngleLimit(0);

ax.setSpeed(500);
ax.setPosition(100);
setInterval(() => { ax.getStatus().then((status) => { console.log(status); }); }, 500);

//ax.getTemperature().then((temperature) => { console.log('Temperature:', temperature); ax.setLED(true); });


//ax.setId(2);
ax.setLED(true);

//ax.getFirmwareVersion();