const EventEmitter = require('events').EventEmitter;
const CAN = require('socketcan');
const exec = require('child_process').execSync;
const Buffer = require('buffer').Buffer;
const spawn = require('child_process').spawn;


const TAG = 'CanDriver';

/**
 * Driver for CAN bus (Controller Area Network)
 * @fires CanDriver#data
 * @fires CanDriver#data_[id]
 */
class CanDriver extends EventEmitter {

    /**
     * Creates instance of CanDriver
     * @param name {String} - Unique name of a driver
     * @param config {Object} - Configuration presented as an associative array
     */
    constructor(name, config) {
        super();
        let canDriver = this;

        this.name = name;
        this.config = Object.assign({
            device: 'can0',
            bitrate: 125000
        }, config);

        this._startCAN(this.config.device, this.config.bitrate);

        this.channel = CAN.createRawChannel(this.config.device, true);
        this.channel.addListener('onMessage', (message) => {
            /**
             * Data arrived for specific ID.
             * @event CanDriver#data_[id]
             * @property {Buffer} data - Data received from CAN
             */
            canDriver.emit('data_' + message.id, message.data);

            /**
             * Data arrived.
             * @event CanDriver#data
             * @property {Number} id - ID of the function
             * @property {Buffer} data - Data received from CAN
             */
            canDriver.emit('data', message.id, message.data);

            Mep.Log.debug(TAG, 'Message received', message);
        });
        this.channel.start();

        Mep.Log.debug(TAG, 'Driver with name', name, 'initialized');
    }

    /**
     * Send buffer to specific ID
     * @param id
     * @param buffer
     *
     * @example
     * canDriver.send(0x4324234, Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72, 0x00, 0x00]));
     */
    send(id, buffer) {
        let canMessage = {
            id: id,
            ext: true,
            rtr: false,
            data : buffer
        };
        this.channel.send(canMessage);
    }

    _startCAN(device, bitrate) {
        let result;

        exec('sudo ip link set ' + device + ' down type can');

        result = exec('sudo ip link set ' + device + ' up type can bitrate ' + bitrate);
        if (result.toString()) {
            Mep.Log.error(TAG, result.toString());
            Mep.driverManager.putDriverOutOfOrder(this.name);
        }
    }

    getGroups() {
        return [];
    }
}

module.exports = CanDriver;