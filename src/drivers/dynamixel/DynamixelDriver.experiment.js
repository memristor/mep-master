global.Mep = require('../../Mep');
const AX12 = require('./DynamixelDriver');
const CAN = require('../can/CanDriver');

let ican = new CAN('CANTest', {});

let ax1 = new AX12('test', {
    id: 5,
    cid: 2000,
    _communicator: ican
});

let ax2 = new AX12('test', {
    id: 4,
    cid: 2000,
    _communicator: ican
});



//ax1.setLED(true);
//ax1.setSpeed(1000, false);

ax1.getPosition()
    .then((pos) => { console.log(pos); })
    .catch(() => { console.log('fail'); });
ax1.go(330).then(() => {
    console.log('success');
}).catch(() => {
    console.log('fail');
});
//ax2.setSpeed(500);
//ax2.setPosition(1000);

function move(pos) {
    ax1.setSpeed(200);
    pos = Math.abs(pos);
    ax1.go(pos, {timeout: 2000}).then(() => {
        move((pos + 50) % 200 + 1);
        console.log('Uspjesno');
    }).catch(() => {
        console.log('Greska');
        move((pos + 50) % 200 + 1);
    });
}
//move();
//console.log('start');
//ax1.go(1).then(() => { console.log('asdasdasd'); });
//move(100);
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