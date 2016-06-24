const Log = require('../Log');
const SerialPort = require("serialport").SerialPort;

const TAG = 'SerialDevice';

const DEVICE = '/dev/tty-';

module.exports = class {
    constructor() {
        this.serialPort = new SerialPort(DEVICE, {
            baudRate: 115200
        });

        this.serialPort.open(function(error) {
            if (error) {
                Log.error(TAG, 'Cannot open driver');
            }

            serialPort.on('data', function(data) {
                // notify all
            });
        });
    }

    send() {
        //serialPort.write(data, callback);
    }

}