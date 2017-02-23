'use strict';

/** @namespace drivers.pin */

const TAG = 'PinDriver';

/**
 * Communicates with pins on microcontrollers.
 * @memberOf drivers.pin
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class PinDriver {
    constructor(name, config) {
        this.config = Object.assign({
            mode: 'analog',     // `analog` or `digital`
            direction: 'input', // `input` or `output`
        }, config);
        this.name = name;

        if (this.config.id === undefined) {
            throw Error(TAG, this.name, 'You must provide ID');
        }

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
        this.communicator.on('data_' + this.config.id, this._onDataReceived);
    }

    _onDataReceived(data) {
        if (this.uniqueDataReceivedCallback !== null) {
            this.uniqueDataReceivedCallback(data);
        }
    }

    read() {
        if (this.config.direction === 'input') {
            return new Promise((resolve, reject) => {
                this.uniqueDataReceivedCallback = (data) => {
                    resolve(data.readUint8(0));
                    this.uniqueDataReceivedCallback = null;
                };
                this.communicator.send(this.config.id, Buffer.from([]));
            });
        } else {
            throw Error('Cannot read output pin');
        }
    }

    write(value) {
        if (this.config.direction === 'output') {
            if (this.config.mode === 'digital' && value != 1 && value != 0) {
                value = 1;
            }
            this.communicator.send(this.config.id, Buffer.from([value]));
        } else {
            throw Error('Cannot write to input pin');
        }
    }
}