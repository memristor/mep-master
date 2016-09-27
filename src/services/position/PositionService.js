const driverManager = Mep.require('drivers/DriverManager').get();
const MotionDriver = Mep.require('drivers/motion/MotionDriver');
const PositionEstimator = require('./PositionEstimator');

const TAG = 'PositionService';

class PositionService {
    constructor() {
        var that = this;

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


        this.defaultMoveOptions = {
            pathfinding: false,
            direction: 'forward',
            relative: false,
            tolerance: 3,
            speed: 100
        };

        this.defaultRotateOptions = {
            relative: false
        };

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

    set(tunedPoint, options, done, progress) {
        // Override the default options
        var fullOptions = this.defaultMoveOptions;
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
                MotionDriver.DIRECTION_BACKWARD :
                MotionDriver.DIRECTION_FORWARD
        );

        Mep.Log.debug(TAG, 'Robot move command sent.', tunedPoint.getPoint(), fullOptions);

        // Check when robot reached the position
        return new Promise(
            function (resolve, reject) {
                this.positionEstimator.on('positionChanged', function (position) {
                    if (point.getDistance(position) <= fullOptions.tolerance) {
                        resolve(1);
                    }
                });
            }
        );
    }

    rotate(tunedAngle, options) {

    }
}

module.exports = PositionService;
