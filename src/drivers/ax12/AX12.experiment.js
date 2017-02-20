global.Mep = require('../../Mep');
const AX12 = require('./AX12');
const CAN = require('../can/CanDriver');

let ax = new AX12('test', {
    _communicator: new CAN('CANTest', {})
});

ax.setLED(true);
ax.getTemperature();
//ax.setSpeed(100);
//ax.setPosition(100);