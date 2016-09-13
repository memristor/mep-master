const driverManager = Mep.require('drivers/DriverManager').get();
const MotionDriver = Mep.require('drivers/motion/MotionDriver');

const TAG = 'PositionService';

class PositionService {
     constructor() {
         this.defaultMoveOptions = {
             pathfinding: false,
             direction: 'forward',
             relative: false
         };

         this.defaultRotateOptions = {
             relative: false
         };
     }

    set(tunedPoint, options, done, progress) {
        // Override the default options
        var fullOptions = this.defaultMoveOptions;
        for (let optionKey in options) {
            fullOptions[optionKey] = options[optionKey];
        }

        // Check if driver is active
        if (driverManager.isDriverAvailable('MotionDriver') === false) {
            Mep.Log.warn(TAG, 'No motion driver available');
            return;
        }

        // Move the robot
        var motionDriver = driverManager.getDriver('MotionDriver');
        var point = tunedPoint.getPoint();
        motionDriver.moveToPosition(
            point.getX(),
            point.getY(),
            (fullOptions.direction == 'backward') ?
                MotionDriver.DIRECTION_BACKWARD :
                MotionDriver.DIRECTION_FORWARD
        );

        Mep.Log.debug(TAG, 'Robot move command sent.', tunedPoint.getPoint(), fullOptions);
    }

    rotate(tunedAngle, options) {

    }
}

module.exports = PositionService;
