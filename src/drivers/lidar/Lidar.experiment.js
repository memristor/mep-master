global.Mep = require('../../Mep');
const LidarDriver = require('./LidarDriver');
const CAN = require('../can/CanDriver');

let can = new CAN('CANTest', {});



let lidar = new LidarDriver('Lidar', {
    cid: 8000,
    eventPeriod: 1000,
    _communicator: can
});