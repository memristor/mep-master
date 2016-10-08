const driverManager = Mep.getDriverManager();
const MotionDriverConstants = Mep.require('drivers/motion/Constants');
const PositionEstimator = require('./PositionEstimator');

const TAG = 'PositionService';

class PositionService {
    constructor(config) {
        var that = this;

        this.config = config;
        this.currentSpeed = 100;
        this.positionEstimator = new PositionEstimator();
        this.modbusDriver = driverManager.getDriver('ModbusDriver');
        this.motionDriver = null;
        this.motionDriverAvailable = true;


        // Check if driver is active
        if (driverManager.isDriverAvailable('MotionDriver') === true) {
            this.motionDriver = driverManager.getDriver('MotionDriver');
        } else {
            this.motionDriverAvailable = false;
            Mep.Log.warn(TAG, 'No motion driver available');
        }

        // Subscribe to stop
        for (let iSlaveAddress = 1; iSlaveAddress <= 1; iSlaveAddress++) {
            for (let iFunctionAddress = 0; iFunctionAddress <= 9; iFunctionAddress++) {
                this.modbusDriver.registerCoilReading(iSlaveAddress, iFunctionAddress);
            }
        }

        this.modbusDriver.on('coilChanged', function (slaveAddress, functionAddress, state, id) {
            if (that.motionDriverAvailable === true) {
                that.motionDriver.stop();
            }
        });
    }

    set(tunedPoint, options) {
        // Override the default options
        var fullOptions = Object.assign({}, this.config.moveOptions);

        for (let optionKey in options) {
            fullOptions[optionKey] = options[optionKey];
        }

        // Set speed
        if (this.currentSpeed !== fullOptions.speed) {
            this.currentSpeed = fullOptions.speed;
            this.motionDriver.setSpeed(fullOptions.speed);
        }

        // Move the robot
        var point = tunedPoint.getPoint();
        this.motionDriver.moveToPosition(
            point.getX(),
            point.getY(),
            (fullOptions.direction === 'backward') ?
                MotionDriverConstants.DIRECTION_BACKWARD :
                MotionDriverConstants.DIRECTION_FORWARD
        );

        Mep.Log.debug(TAG, 'Robot move command sent.', tunedPoint.getPoint(), fullOptions);

        // Check when robot reached the position
        return new Promise((resolve, reject) => {
            this.positionEstimator.on('positionChanged', (position) => {
                if (point.getDistance(position) <= fullOptions.tolerance) {
                    resolve();
                }
            });
        });
    }

    rotate(tunedAngle, options) {

    }
}

module.exports = PositionService;
