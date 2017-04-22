'use strict';

/** @namespace drivers.pin */

const EventEmitter = require('events').EventEmitter;

const TAG = 'PinDriver';

/**
 * Communicates with pins on microcontrollers.
 * @memberOf drivers.pin
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class PinDriver extends EventEmitter {
    constructor(name, config) {
        super();

        this.config = Object.assign({
            mode: 'analog',     // `analog` or `digital`
            direction: 'input', // `input` or `output`
        }, config);
        this.name = name;

        if (this.config.cid === undefined) {
            throw Error(TAG, this.name, 'You must provide a communication ID');
        }

        this._value = 0;

        this._onDataReceived = this._onDataReceived.bind(this);
        this.uniqueDataReceivedCallback = null;

        // Set-up communicator
        this.communicator = null;
        if (this.config._communicator !== undefined) {
            // For testing purposes only (experiments)
            this.communicator = this.config._communicator;
        } else {
            this.communicator = Mep.DriverManager.getDriver(this.config['@dependencies'].communicator);
        }
        this.communicator.on('data_' + this.config.cid, this._onDataReceived);
    }

    _onDataReceived(data) {
        if (data.length !== 1) return;

        if (this.uniqueDataReceivedCallback !== null) {
            this.uniqueDataReceivedCallback(data);
        }

        if (this.config.direction === 'input') {
            this._value = data.readUInt8(0);
            this.emit('changed', this._value);
        }
    }

    /**
     * Get last value
     * @example let value = Mep.getDriver('PinDriver').getLastState();
     * @returns {Number} High or low
     */
    getLastValue() {
        return this._value;
    }

    /**
     * Read value of given pin
     * @example Mep.getDriver('PinDriver').read((value) => { console.log(value) });
     * @returns {Promise}
     */
    read() {
        return new Promise((resolve, reject) => {
            if (this.config.direction === 'input') {
                this.uniqueDataReceivedCallback = (data) => {
                    resolve(data.readUint8(0));
                    this.uniqueDataReceivedCallback = null;
                };
                this.communicator.send(this.config.cid, Buffer.from([]));
            } else {
                throw Error('Cannot read output pin');
            }
        });
    }

    /**
     * Write value to given pin
     * @param {Number} value [0, 1] for digital pins or [0 - 255] for analog pins
     */
    write(value) {
        if (this.config.direction === 'output') {
            if (this.config.mode === 'digital' && value != 1 && value != 0) {
                value = 1;
            }
            let buffer = Buffer.from([value]);
            this.communicator.send(this.config.cid, buffer);
        } else {
            throw Error('Cannot write to input pin');
        }
    }

    getGroups() {
        return [];
    }
}

module.exports = PinDriver;