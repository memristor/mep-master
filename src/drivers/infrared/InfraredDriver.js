/** @namespace drivers.infrared */

const EventEmitter = require('events').EventEmitter;
const Point = Mep.require('types/Point');
const Polygon = Mep.require('types/Polygon');

const TAG = 'InfraredDriver';

/**
 * Uses data from infrared sensors to determine where is an enemy robot and other obstacles.
 *
 * @memberof drivers.infrared
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 * @fires InfraredDriver#terrain
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
     *  Sensor s1 params: sensorAngle~=60, sensorX~=-10, sensorY~=10
     *  Sensor s2 params: sensorAngle~=90, sensorX~=0, sensorY~=10
     *  Sensor s3 params: sensorAngle~=110, sensorX~=10, sensorY~=10
     *  </pre>
     *
     * @param name {String} - Unique driver name
     * @param config.infraredMaxDistance {Number} - Maximum distance when driver detects an object
     * @param config.sensorAngle {Number} - Angle relative to the robot (look at the picture above)
     * @param config.sensorX {Number} - Sensor translated on x coordinate
     * @param config.sensorY {Number} - Sensor translated on y coordinate
     * @param config.deviceId {Number} - Function ID for CAN driver
     * @param config.objectSize {Number} - Approximation coefficient for obstacle size. Distance between edges and point of interest.
     */
    constructor(name, config) {
        super();

        // Check arguments
        if (typeof config.infraredMaxDistance === 'undefined') {
            throw '`config.infraredMaxDistance` is not defined';
        }
        if (typeof config.sensorAngle === 'undefined' || config.sensorAngle < 0 || config.sensorAngle > 360) {
            throw '`config.sensorAngle` is not defined or angle is out of the range (0 - 360)';
        }
        if (typeof config.sensorX === 'undefined' || typeof config.sensorY === 'undefined') {
            throw '`config.sensorX` or `config.sensorY` is not defined';
        }
        if (typeof config.deviceId === 'undefined') {
            throw '`config.deviceId` is not defined';
        }
        if (typeof config['@dependencies'].communicator === 'undefined') {
            throw 'Infrared driver requires driver which enables communication with electronics board (eg. CanDriver)';
        }
        this.config = Object.assign({
            duration: 2000
        }, config);
        this.detected = false;
        this.timeoutHandle = null;

        // Subscribe on ModbusDriver
        this.canDriver = Mep.getDriverManager().getDriver(config['@dependencies'].communicator);
        this.canDriver.on('data_' + config.deviceId, this.processDetection.bind(this));


        // Pre-calculate coordinates relative to robot
        this.x = Math.round(config.infraredMaxDistance * Math.cos(config.sensorAngle * Math.PI / 180));
        this.y = Math.round(config.infraredMaxDistance * Math.sin(config.sensorAngle * Math.PI / 180));


        // Translate
        this.x += config.sensorX;
        this.y += config.sensorY;

        // Approximation of detected object
        this.pointOfInterest = new Point(this.x, this.y);
        let points = [
            new Point(this.x - config.objectSize, this.y - config.objectSize),
            new Point(this.x + config.objectSize, this.y - config.objectSize),
            new Point(this.x + config.objectSize, this.y + config.objectSize),
            new Point(this.x - config.objectSize, this.y + config.objectSize)
        ];
        this.polygon = new Polygon(name, this.config.duration, points);

        // Additional information
        this.front = (config.sensorAngle > 0 && config.sensorAngle < 180);

        Mep.Log.debug(TAG, name, 'Detects at', '(' + this.x + ', ' + this.y + ')');
    }

    /**
     * Process detected obstacle
     *
     * @private
     * @param state {boolean} - Object is detected or not
     */
    processDetection(buffer) {
        console.log(buffer);
        this.detected = !!(buffer.readInt8(0));

        /**
         * Obstacle detected on the robot's terrain event. We need to stop robot as fast as possible.
         * @event InfraredDriver#pathObstacleDetected
         * @property {Boolean} - Obstacle is detected
         */
        this.emit('pathObstacleDetected', this.detected, this.front);

        /**
         * Obstacle detected event.
         * @event InfraredDriver#obstacleDetected
         * @property {Point} - Center of detected obstacle
         * @property {Polygon} - Obstacle is approximated with a polygon
         * @property {Boolean} - Is objected detected or not
         * @property {Object} - Additional information about detected object
         */
        this.emit('obstacleDetected', this.pointOfInterest, this.polygon, this.detected);


        // After `duration` publish obstacle detection again if object is still there
        if (this.timeoutHandle !== null) {
            clearTimeout(this.timeoutHandle);
        }
        if (this.detected === true) {
            let infraredDriver = this;
            this.timeoutHandle = setTimeout(() => {
                infraredDriver.processDetection(buffer);
            }, this.config.duration);
        }

        Mep.Log.debug(TAG, 'Detected at', this.x, this.y);
    }

    getGroups() {
        return ['terrain'];
    }
}

module.exports = InfraredDriver;