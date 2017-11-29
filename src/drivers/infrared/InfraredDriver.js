'use strict';

/** @namespace drivers.infrared */

const EventEmitter = require('events').EventEmitter;
const Point = Mep.require("misc/geometry/Point");
const Polygon = Mep.require("misc/geometry/Polygon");

const TAG = 'InfraredDriver';

/**
 * Uses data from infrared sensors to determine where is an enemy robot and other obstacles.
 *
 * @memberOf drivers.infrared
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 * @fires drivers.infrared.InfraredDriver#obstacleDetected
 */
class InfraredDriver extends EventEmitter {
    /**
     * Make instance of InfraredDriver.
     *
     * <pre>
     * Check image bellow to understand `sensorAngle`, `sensorX` & `sensorY`
     *  s1   s2   s3
     *   \   |   /
     *  |---------|
     *  |  Robot  |
     *  |_________|
     *
     *  Sensor s1 params: sensorAngle~=110, sensorY~10, sensorX~=10
     *  Sensor s2 params: sensorAngle~=90, sensorY~=0, sensorX~=10
     *  Sensor s3 params: sensorAngle~=60, sensorY~=-10, sensorX~=10
     *  </pre>
     *
     * @param name {String} - Unique driver name
     * @param config.infraredMaxDistance {Number} - Maximum distance when driver detects an object
     * @param config.sensorAngle {Number} - Angle relative to the robot (look at the picture above)
     * @param config.sensorX {Number} - Sensor translated on x coordinate
     * @param config.sensorY {Number} - Sensor translated on y coordinate
     * @param config.cid {Number} - Function ID for CAN driver
     * @param config.objectSize {Number} - Approximation coefficient for obstacle size. Distance between edges and point of interest,
     * @param config['@dependencies'] {String} - ID of Driver can provide communication between core and electronics
     */
    constructor(name, config) {
        super();

        // Check arguments
        if (typeof config.infraredMaxDistance === 'undefined') {
            throw '`config.infraredMaxDistance` is not defined';
        }
        if (typeof config.cid === 'undefined') {
            throw '`config.cid` is not defined';
        }

        this.config = Object.assign({
            objectSize: 150,
            sensorX: 0,
            sensorY: 0,
            sensorAngle: 90
        }, config);
        this.name = name;
        this._detected = false;
        this._timeoutHandle = null;
        this._enabled = true;

        // Subscribe on communicator
        if (this.config._communicator === undefined) {
            this.canDriver = Mep.getDriver(this.config['@dependencies'].communicator);
        } else {
            this.canDriver = this.config._communicator;
        }
        this.canDriver.on('data_' + this.config.cid, this.processDetection.bind(this));

        // Approximation of detected object
        this.poi = new Point(this.config.sensorX, this.config.sensorY + this.config.infraredMaxDistance);
        this.polygon = new Polygon(name, Mep.Config.get('obstacleMaxPeriod'), [
            new Point(this.poi.getX() - this.config.objectSize, this.poi.getY() - this.config.objectSize),
            new Point(this.poi.getX() + this.config.objectSize, this.poi.getY() - this.config.objectSize),
            new Point(this.poi.getX() + this.config.objectSize, this.poi.getY() + this.config.objectSize),
            new Point(this.poi.getX() - this.config.objectSize, this.poi.getY() + this.config.objectSize)
        ]);

        // We are using inverted (`-`) angle because X and Y coordinate are replaced
        this.poi.rotate(new Point(this.config.sensorX, this.config.sensorY), - this.config.sensorAngle);
        this.polygon.rotate(new Point(this.config.sensorX, this.config.sensorY), - this.config.sensorAngle);

        Mep.Log.debug(TAG, name, 'Detects at', this.poi);
    }

    /**
     * Enable sensor
     */
    enable() {
        this._enabled = true;
    }

    /**
     * Disable sensor
     */
    disable() {
        this._enabled = false;
    }

    /**
     * Process detected obstacle
     * @private
     * @param buffer {Boolean} - Object is detected or not
     */
    processDetection(buffer) {
        if (this._enabled === false) return;

        this._detected = !!(buffer.readInt8(0));

        /**
         * Obstacle detected event.
         * @event drivers.infrared.InfraredDriver#obstacleDetected
         * @property {String} - Source name
         * @property {misc.Point} - Center of detected obstacle
         * @property {misc.Polygon} - Obstacle is approximated with a polygon
         * @property {Boolean} - Is objected detected or not
         * @property {Object} - Additional information about detected object
         */
        this.emit(
            'obstacleDetected',
            this.name,
            this.poi.clone(),
            this.polygon.clone(),
            this._detected
        );

        // After `duration` publish obstacle detection again if object is still there
        if (this._timeoutHandle !== null) {
            clearTimeout(this._timeoutHandle);
        }
        if (this._detected === true) {
            let infraredDriver = this;
            this._timeoutHandle = setTimeout(() => {
                infraredDriver.processDetection(buffer);
            }, Mep.Config.get('obstacleMaxPeriod') - 100);
        }

        Mep.Log.debug(TAG, this.name, 'Detected at', this.poi);
    }

    getGroups() {
        return ['terrain'];
    }
}

module.exports = InfraredDriver;