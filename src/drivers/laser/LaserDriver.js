/** @namespace drivers.laser */

const TerrainDriver = Mep.require('types/TerrainDriver');
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
class LaserDriver extends TerrainDriver {
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
     * @param config.objectSize {Number} - Approximation coefficient for obstacle size. Distance between edges and point of interest.
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

        // Approximation of detected object
        this.pointOfInterest = new Point(this.x, this.y);
        let points = [
            new Point(this.x - config.objectSize, this.y - config.objectSize),
            new Point(this.x + config.objectSize, this.y - config.objectSize),
            new Point(this.x + config.objectSize, this.y + config.objectSize),
            new Point(this.x - config.objectSize, this.y + config.objectSize)
        ];
        this.polygon = new Polygon(name, 2000, points);

        // Additional information
        this.front = (config.laserAngle > 0 && config.laserAngle < 180);

        Mep.Log.debug(TAG, name, 'Detects at ', this.x, this.y);
    }

    /**
     * Process detected obstacle
     *
     * @private
     * @param state {boolean} - Object is detected or not
     */
    processDetection(state) {
        if (this.front === true) {
            /**
             * Obstacle detected on the robot's path event. We need to stop robot as fast as possible.
             * @event LaserDriver#pathObstacleDetected
             * @property {Boolean} - Obstacle is detected
             */
            this.emit('pathObstacleDetected', state);
        }

        /**
         * Obstacle detected event.
         *
         * @event LaserDriver#obstacleDetected
         * @property {Point} - Center of detected obstacle
         * @property {Polygon} - Obstacle is approximated with a polygon
         * @property {Boolean} - Is objected detected or not
         * @property {Object} - Additional information about detected object
         */
        this.emit('obstacleDetected', this.pointOfInterest, this.polygon, state);

        Mep.Log.debug(TAG, 'Detected at', this.x, this.y);
    }

    static dependencies() {
        return ['ModbusDriver'];
    }
}

module.exports = LaserDriver;