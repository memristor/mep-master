/** @namespace drivers.laser */

const EventEmitter = require('events');
const Point = Mep.require('types/Point');
const Polygon = Mep.require('types/Polygon');

const TAG = 'LaserDriver';

/**
 * Uses data from laser sensors to determine where is an enemy robot and other obstacles.
 *
 * @memberof drivers.laser
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 * @fires LaserDriver#terrain
 */
class LaserDriver extends EventEmitter {
    /**
     * Make instance of LaserDriver.
     *
     * <pre>
     * Check image bellow to understand `laserAngle`, `laserX` & `laserY`
     *  s1   s2   s3
     *   \   |   /
     *  |---------|
     *  |  Robot  |
     *  |_________|
     *
     *  Sensor s1 params: laserAngle~=60, laserX~=-10, laserY~=10
     *  Sensor s2 params: laserAngle~=90, laserX~=0, laserY~=10
     *  Sensor s3 params: laserAngle~=110, laserX~=10, laserY~=10
     *  </pre>
     *
     * @param name {String} - Unique driver name
     * @param config.laserMaxDistance {Number} - Maximum distance when driver detects an object
     * @param config.laserAngle {Number} - Angle relative to the robot (look at the picture above)
     * @param config.laserX {Number} - Sensor translated on x coordinate
     * @param config.laserY {Number} - Sensor translated on y coordinate
     * @param config.functionAddress {Number} - Function address of Modbus coil
     * @param config.slaveAddress {Number} - Slave address of Modbus coil
     */
    constructor(name, config) {
        super();

        // Check arguments
        if (typeof config.laserMaxDistance === 'undefined') {
            throw '`config.laserMaxDistance` is not defined';
        }
        if (typeof config.laserAngle === 'undefined' || config.laserAngle < 0 || config.laserAngle > 360) {
            throw '`config.laserAngle` is not defined or angle is out of the range (0 - 360)';
        }
        if (typeof config.laserX === 'undefined' || typeof config.laserY === 'undefined') {
            throw '`config.laserX` or `config.laserY` is not defined';
        }
        if (typeof config.functionAddress === 'undefined' || typeof config.slaveAddress === 'undefined') {
            throw '`config.functionAddress` or `config.slaveAddress` is not defined';
        }


        // Subscribe on ModbusDriver
        this.modbusDriver = Mep.getDriverManager().getDriver('ModbusDriver');
        this.modbusDriver.registerCoilReading(config.slaveAddress, config.functionAddress);
        this.modbusDriver.on('coilChanged_' + config.slaveAddress + '_' + config.functionAddress, this.processDetection);


        // Pre-calculate coordinates relative to robot
        this.x = Math.round(config.laserMaxDistance * Math.cos(config.laserAngle * Math.PI / 180));
        this.y = Math.round(config.laserMaxDistance * Math.sin(config.laserAngle * Math.PI / 180));


        // Translate
        this.x += config.laserX;
        this.y += config.laserY;

        let points = [
            new Point(this.x, this.y),
            new Point(this.x, this.y),
            new Point(this.x, this.y),
            new Point(this.x, this.y)
        ];
        this.polygon = new Polygon(name, 2000, points);
        this.centerPoint = new Point(this.x, this.y);

        Mep.Log.debug(TAG, name, 'Detects at ', this.x, this.y);
    }

    /**
     * Process detected obstacle
     *
     * @private
     * @param state {boolean} - Object is detected or not
     */
    processDetection(state) {
        /**
         * Obstacle detected event.
         *
         * @event LaserDriver#terrain
         * @property {Point} - Center of detected obstacle
         * @property {Polygon} - Obstacle is approximated with a polygon
         * @property {Boolean} - Is objected detected or not
         */
        this.emit('obstacleDetected', this.centerPoint, this.polygon, state);

        Mep.Log.debug(TAG, 'Detected at', this.x, this.y);
    }

    provides() {
        return ['path'];
    }
}

module.exports = LaserDriver;