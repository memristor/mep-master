console.info('Run experiment using:');
console.info('node --harmony-async-await DynamixelDriver.experiment.js');
console.info('');

global.Mep = require('../../Mep');
const AX12 = require('./DynamixelDriver');
const CAN = require('../can/CanDriver');

let ax2 = new AX12('test', {
    id: 2,
    cid: 2000,
    _communicator: new CAN('CANTest', {})
});


let ax1 = new AX12('test', {
    id: 1,
    cid: 2000,
    _communicator: new CAN('CANTest', {})
});


//ax1.setLED(false);
ax1.setSpeed(200);

function move(pos) {
    ax1.setSpeed(100);
    pos = Math.abs(pos);
    ax1.go(pos, {timeout: 2000}).then(() => {
        move((pos + 50) % 200 + 1);
        console.log('Uspjesno');
    }).catch(() => {
        console.log('Greska');
        move((pos + 50) % 200 + 1);
    });
}
console.log('start');
//ax1.go(1).then(() => { console.log('asdasdasd'); });
move(100);
//ax2.setId(2);

/*
ax1.setSpeed(100);
ax1.go(100, { timeout: 5000, firmwareImplementation: false }).then(() => {
    ax2.go(100);
});
*/

//ax.setCWAngleLimit(0);
//ax.setCCWAngleLimit(0);

// ax.setSpeed(0);
//ax.setPosition(100);
//setInterval(() => { ax.getStatus().then((status) => { console.log(status); }); }, 500);

//setInterval(() => { ax.getTemperature().then((temperature) => { console.log('Temperature:', temperature); }) }, 300);

//ax.setId(2);
//ax1.setLED(true);

//ax.getFirmwareVersion();