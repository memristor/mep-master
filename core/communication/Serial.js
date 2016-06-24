const Config = require('../Config');
const SerialDevice = require('./SerialDevice');
const SerialSimulator = require('./SerialSimulator');

/*
 * Abstraction class which communicates with motion driver.
 * IMPORTANT: SerialDevice and SerialSimulator must have same prototype.
 */
if (Config.SIMULATION == true) {
    module.exports = SerialSimulator;
} else {
    module.exports = SerialDevice;
}
