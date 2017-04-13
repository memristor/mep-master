'use strict';

/** @namespace drivers.color */

const EventEmitter = require('events').EventEmitter;

const TAG = 'ColorDriver';


/**
 * @memberOf drivers.color
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class ColorDriver extends EventEmitter {
    constructor(name, config) {
        super();

        this.config = Object.assign({
            tolerance: 10,
            // perception: [ 0.30, 0.59, 0.11 ]
            perception: [ 0.3, 0.3, 0.3 ]
        }, config);

        this.config.colors = Object.assign({
            yellow: [ 210, 185, 155 ],
            blue: [ 140, 140, 170 ],
            white: [ 210, 210, 210 ]
        }, config.colors);

        this.name = name;

        this._onDataReceived = this._onDataReceived.bind(this);

        this.communicator = null;
        if (this.config._communicator !== undefined) {
            // For testing purposes only (experiments)
            this.communicator = this.config._communicator;
        } else {
            this.communicator = Mep.DriverManager.getDriver(this.config['@dependencies'].communicator);
        }
        this.communicator.on('data_' + this.config.cid, this._onDataReceived);

        this.lastReadings = [];
        this.lastColor = 'undefined';
    }

    start(interval = 100) {
        this.communicator.send(this.config.cid, Buffer.from([interval]));
    }

    stop() {
        this.start(0);
    }

    getColor() {
        let bestMatch = {
            difference: Infinity,
            color: null
        };

        for (let color in this.config.colors) {
            let loopColor = this.config.colors[color];

            // Reference: http://stackoverflow.com/a/1847112/1983050
            let difference = Math.sqrt(
                Math.pow((loopColor[0] - this.lastReadings[0]) * this.config.perception[0], 2) +
                Math.pow((loopColor[1] - this.lastReadings[1]) * this.config.perception[1], 2) +
                Math.pow((loopColor[2] - this.lastReadings[2]) * this.config.perception[2], 2)
            );

            if (difference < bestMatch.difference) {
                bestMatch = {
                    difference: difference,
                    color: color
                };
            }
        }

        if (bestMatch.difference > this.config.tolerance) {
            return 'undefined';
        } else {
            return bestMatch.color;
        }
    }

    _onDataReceived(buffer) {
        if (buffer.length === 3) {
            this.lastReadings = [
                buffer.readUInt8(0),
                buffer.readUInt8(1),
                buffer.readUInt8(2)
            ];

            let color = this.getColor();
            if (color !== 'undefined') {
                this.emit('detected', color);

                if (this.lastColor !== color) {
                    this.lastColor = color;
                    this.emit('changed', color);
                }
            }
        }
    }

    getGroups() {
        return [];
    }
}

module.exports = ColorDriver;