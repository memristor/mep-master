const fs = require('fs');
const tty = require('tty');
const EventEmitter = require('events');
const termios = require('termios');

const TAG = 'Uart';


class Uart extends EventEmitter {
    constructor(name, config) {
        super();

        this.name = name;
        this.config = Object.assign({
            device: '/dev/ttyAMA0',
            baudRate: 57600
        }, config);

        // Set up protocol
        this.protocol = null;
        if (config._protocol !== undefined) {
            this.protocol = config._protocol;
        }
        if (config['@dependencies'] !== undefined &&
            config['@dependencies']['protocol'] !== undefined) {
            this.protocol = Mep.DriverManager.getDriver(config['@dependencies']['protocol']);
        }
        if (this.protocol !== null) {
            this.protocol.on('data', this._onPacketReceived.bind(this));
        }

        // Initialize sending queue
        this.enableSend = true;
        this.queueSend = [];

        // Initialize input and output stream
        let fd = fs.openSync(this.config.device, fs.O_NOCTTY | fs.O_RDWR | fs.O_SYNC);
        termios.setattr(fd, {
            cbaud: this.config.baudRate,
            lflag: { ICANON: false, ECHO: false, ECHOE: false, ISIG: false },
            iflag: { INLCR: false, ICRNL: false, IGNCR: false },
            oflag: { OPOST: false, ONLCR: false, OCRNL: false }
        });

        this.in = new tty.ReadStream(fd);
        this.out = new tty.WriteStream(fd);
        this.in.setRawMode(true);
        this.in.on('data', this._onDataReceived.bind(this));
    }

    /**
     * Method will be called only if protocol is not `null` and protocol generated packet.
     * @param packet - Parsed packet
     * @private
     */
    _onPacketReceived(packet) {
        this.emit('data', packet);
    }

    _onDataReceived(chunkBuffer) {
        this.in.pause();

        if (this.protocol === null) {
            this.emit('data', chunkBuffer);
        } else {
            this.protocol.push(chunkBuffer);
        }

        this.in.resume();
    }

    send(buffer, callback) {
        let uart = this;

        if (buffer.length === 0) {
            callback('Buffer length cannot be 0');
            return;
        }


        if (uart.enableSend === false) {
            uart.queueSend.push(buffer);
            return;
        }

        this.out.write(
            (this.protocol === null) ? buffer : this.protocol.generate(buffer),
            null,
            callback
        );

        /*
        this.enableSend = false;
        this.out.write(buffer, null, () => {
            setTimeout(() => {
                uart.enableSend = true;
                if (uart.queueSend.length > 0) {
                    let nextBuffer = uart.queueSend.splice(0, 1)[0];
                    uart.send(nextBuffer, callback);
                }
            }, 5);
        });
        */
    }

    getGroups() {
        return [];
    }
}

module.exports = Uart;