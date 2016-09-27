/** @namespace drivers.laser */

const EventEmitter = require('events');
const DriverManager = Mep.require('drivers/DriverManager');

/**
 * Uses data from laser sensors to determinate enemy robot and other obstacles.
 * @memberof drivers.laser
 */
class LaserDriver extends EventEmitter {
    /**
     * Make instance of LaserDriver.
     *
     * <pre>
     * Check image bellow to understand `laserAngle`
     *  s1   s2   s2
     *   \   |   /
     *  |---------|
     *  |  Robot  |
     *  |_________|
     *
     *  Sensor s1 has angle 20 degrees
     *  Sensor s2 has angle 0 degrees
     *  Sensor s3 has angle -30 degrees
     *  </pre>
     *
     * @param slaveAddress
     * @param functionAddress
     * @param laserAngle {number} - Relative to robot's y axis. Range (-180, 180).
     * @param laserDistance {number} - Maximum distance between sensor and obstacle when sensor returns detected signal
     */
    constructor(slaveAddress, functionAddress, laserAngle, laserDistance) {
        this.laserAngle = laserAngle;
        this.laserDistance = laserDistance;
        this.slaveAddress = slaveAddress;
        this.functionAddress = functionAddress;

        this.motionDriver = DriverManager.get().getDriver(DriverManager.MOTION_DRIVER);
        this.modbusDriver = DriverManager.get().getDriver(DriverManager.MODBUS_DRIVER);

        this.modbusDriver.registerCoilReading(slaveAddress, functionAddress);
        this.modbusDriver.on('coilChanged', this.processDetection);
    }

    /**
     * Process detected obstacle
     *
     * @private
     * @param slaveAddress
     * @param functionAddress
     * @param state
     * @param ID
     */
    processDetection(slaveAddress, functionAddress, state, ID) {
        if (slaveAddress == this.slaveAddress && functionAddress == this.functionAddress) {
            // Calculate relative to robot coordinates
            let x = Math.round(this.laserDistance * Math.cos(this.getAngleRelativeToTerrain()));
            let y = Math.round(this.laserDistance * Math.sin(this.getAngleRelativeToTerrain()));

            // Translate. Calculate relative to the
            let position = this.motionDriver.getPosition();
            x += position.getX();
            y += position.getY();

            // TODO: Process...
        }
    }

    /**
     * Calculate angle relative to terrain
     * @private
     * @returns {number} - Angle
     */
    getAngleRelativeToTerrain() {
        return this.motionDriver.getOrientation() + this.laserAngle;
    }

    provides() {
        return ['terrain'];
    }
}

module.exports = LaserDriver;