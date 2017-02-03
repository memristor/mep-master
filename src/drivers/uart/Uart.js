'use strict';
/** @namespace drivers.uart */

const fs = require('fs');
const tty = require('tty');
const EventEmitter = require('events');
const termios = require('termios');

const TAG = 'Uart';

/**
 * Driver enables uart communication with electronic boards
 * @memberOf drivers.uart
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class Uart extends EventEmitter {
    /**
     * @param name {String} - Unique name of driver
     * @param config.device {String} - Linux dev which will be used for serial communication
     * @param config.baudRate {Number} - Bits per second
     * @param config.protocol {String} - Name of protocol that will be used under the hood, check
     * list of available protocols in `misc/protocols`
     */
    constructor(name, config) {
        super();

        this.name = name;
        this.config = Object.assign({
            device: '/dev/ttyAMA0',
            baudRate: 57600
        }, config);

        // Set up protocol
        this.protocol = null;
        if (this.config.protocol !== undefined) {
            const Protocol = Mep.require('misc/protocols/' + this.config.protocol);
            this.protocol = new Protocol({
                onDataCallback: this._onPacketReceived.bind(this)
            });
        }

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
    _onPacketReceived(packet, type) {
        this.emit('data', packet, type);
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

    /**
     * Send data to Uart
     * @param buffer {Buffer} - Buffer of data which will be sent to uart
     * @param callback {Function} - Callback function which will be called after data is sent
     * @param type {Number} - Type of packet, will be ignored if protocol doesn't support
     */
    send(buffer, callback, type) {
        if (buffer.length === 0) {
            Mep.Log.error('Buffer length cannot be 0');
            return;
        }

        let packetizedBuffer;
        if (type === undefined && this.protocol !== null) {
            packetizedBuffer = this.protocol.generate(buffer.slice(1), buffer.readUInt8(0));
        }
        else if (type !== undefined && this.protocol !== null) {
            packetizedBuffer = this.protocol.generate(buffer, type);
        } else {
            packetizedBuffer = buffer;
        }

        this.out.write(
            packetizedBuffer,
            null,
            callback
        );
    }

    getGroups() {
        return [];
    }
}

module.exports = Uart;