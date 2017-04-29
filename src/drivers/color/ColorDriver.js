'use strict';

/** @namespace drivers.color */

const EventEmitter = require('events').EventEmitter;

const TAG = 'ColorDriver';

/**
 * Driver detects color based on RGB components
 * @memberOf drivers.color
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class ColorDriver extends EventEmitter {
    constructor(name, config) {
        super();

        this.config = Object.assign({
            colors: {
                yellow: [ 210, 185, 155 ],
                blue: [ 140, 140, 170 ],
                white: [ 210, 210, 210 ]
            },
            type: 'rgb', // rgb, hsv, hsl
            tolerance: 10,
            // perception: [ 0.30, 0.59, 0.11 ]
            perception: [ 0.3, 0.3, 0.3 ]
        }, config);
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

    /**
     * Start reading data from sensor
     * @param {Number} interval Receive RGB components every `interval`[ms]
     */
    start(interval = 100) {
        this.communicator.send(this.config.cid, Buffer.from([interval]));
    }

    /**
     * Stop receiving RGB components
     */
    stop() {
        this.start(0);
    }

    /**
     * Get last read color
     * @returns {String} Color
     */
    getColor() {
        let bestMatch = {
            difference: Infinity,
            color: null
        };

        for (let color in this.config.colors) {
            let loopColor = this.config.colors[color];

            // Reference: http://stackoverflow.com/a/1847112/1983050
            let difference = null;
            switch (this.config.type) {
                case 'hsv': case 'hsl':
                    difference = Math.sqrt(
                        Math.pow((loopColor[0] - this.lastReadings[0]) * this.config.perception[0], 2) +
                        Math.pow((loopColor[1] - this.lastReadings[1]) * this.config.perception[1], 2)
                    );
                    break;

                default:
                    difference = Math.sqrt(
                        Math.pow((loopColor[0] - this.lastReadings[0]) * this.config.perception[0], 2) +
                        Math.pow((loopColor[1] - this.lastReadings[1]) * this.config.perception[1], 2) +
                        Math.pow((loopColor[2] - this.lastReadings[2]) * this.config.perception[2], 2)
                    );
                    break;
            }


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

            // Convert if needed
            switch (this.config.type) {
                case 'hsv':
                    this.lastReadings = this.rgbToHsv(...this.lastReadings);
                    break;

                case 'hsl':
                    this.lastReadings = this.rgbToHsl(...this.lastReadings);
                    break;

                case 'rgb':
                    // Already RGB
                    break;

                default:
                    Mep.Log.error(TAG, this.config.type, 'is not available');
                    break;
            }
            // Mep.Log.debug(TAG, 'Readings', this.lastReadings);

            // Detect color
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

    /**
     * Converts an RGB color value to HSV. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h, s, and v in the set [0, 1].
     * @ref https://gist.github.com/mjackson/5311256
     * @param {Number}  r       The red color value
     * @param {Number}  g       The green color value
     * @param {Number}  b       The blue color value
     * @return  Array           The HSV representation
     */
    rgbToHsv(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, v = max;

        let d = max - min;
        s = max === 0 ? 0 : d / max;

        if (max === min) {
            h = 0; // achromatic
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }

            h /= 6;
        }

        return [ (h * 255) | 0, (s * 255) | 0, (v * 255) | 0 ];
    }

    /**
     * Converts an RGB color value to HSL. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h, s, and l in the set [0, 1].
     * @ref https://gist.github.com/mjackson/5311256
     * @param {Number}  r       The red color value
     * @param {Number}  g       The green color value
     * @param {Number}  b       The blue color value
     * @return  Array           The HSL representation
     */
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }

            h /= 6;
        }

        return [ (h * 255) | 0, (s * 255) | 0, (l * 255) | 0 ];
    }


    getGroups() {
        return [];
    }
}

module.exports = ColorDriver;