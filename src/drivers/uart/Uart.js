const Buffer = require('buffer').Buffer;
const SerialPort = require('serialport');
const EventEmitter = require('events');

const TAG = 'Uart';

class Uart extends EventEmitter {
    constructor(name, config) {
        super();

        this.name = name;
        this.config = Object.assign({
            device: '/dev/ttyAMA0',
            baudRate: 57600
        }, config);
        this.port = null;

        this.enableSend = true;
        this.queueSend = [];
    }

    init(finishedCallback) {
        this.port = new SerialPort(this.config.device, {
            baudRate: this.config.baudRate
        }, finishedCallback);

        this.port.on('data', this._onDataReceived.bind(this));
        this.port.on('error', this._onCommunicationError.bind(this));
    }

    send(buffer, callback) {
        let uart = this;

        if (uart.enableSend == false) {
            uart.queueSend.push(buffer);
            return;
        }

        uart.enableSend = false;
        uart.port.write(buffer, () => {
            uart.port.drain(() => {
                setTimeout(() => {
                    uart.enableSend = true;
                    if (uart.queueSend.length > 0) {
                        let nextBuffer = uart.queueSend.splice(0, 1)[0];
                        uart.send(nextBuffer, callback);
                    }
                }, 5);
            });
        });
    }

    _onDataReceived(buffer) {
        this.emit('data', buffer);
    }

    _onCommunicationError(e) {
        throw Error(TAG, 'Error in UART', e);
    }

    getGroups() {
        return [];
    }
}

module.exports = Uart;