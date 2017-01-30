const fs = require('fs');
const tty = require('tty');
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

        this.in = new tty.ReadStream(fs.openSync(this.config.device, 'r'));
        this.out = new tty.WriteStream(fs.openSync(this.config.device, 'w'));
        this.in.setRawMode(true);
        this.in.on('data', this._onDataReceived.bind(this));
    }

    _onDataReceived(data) {
        this.emit('data', data);
    }

    send(buffer, callback) {
        this.out.write(buffer, callback);

        /*
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
        */
    }

    getGroups() {
        return [];
    }
}

module.exports = Uart;