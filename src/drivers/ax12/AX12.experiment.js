global.Mep = require('../../Mep');
const AX12 = require('./AX12');
const CAN = require('../can/CanDriver');

let ax = new AX12('test', {
    id: 1,
    _communicator: new CAN('CANTest', {})
});


//ax.setCWAngleLimit(0);
//ax.setCCWAngleLimit(0);

//ax.getStatus().then((status) => { console.log(status); });

//ax.getTemperature().then((temperature) => { console.log('Temperature:', temperature); ax.setLED(true); });

ax.setSpeed(400);
ax.setPosition(200);

setInterval(() => {
    ax.getStatus().then((status) => { console.log(status); });
}, 500);

//ax.setLED(true);