'use strict';
/** @namespace drivers.motion */

const TAG = 'MotionDriverController';

/**
 * Remote controller for motion driver
 * @memberOf drivers.motion
 */
class MotionDriverController {
    constructor(name, config) {
        let motionDriver = Mep.getDriver(config['@dependencies'].motionDriver);

        // Set X
        Mep.Telemetry.on(Mep.Telemetry.genOn(TAG, 'moveToPositionX'), (packet) => {
            let currentPosition = Mep.Position.getPosition();
            motionDriver.moveToPosition(currentPosition.getX() + packet.params.value, currentPosition.getY());
        });

        // Set Y
        Mep.Telemetry.on(Mep.Telemetry.genOn(TAG, 'moveToPositionY'), (packet) => {
            let currentPosition = Mep.Position.getPosition();
            motionDriver.moveToPosition(currentPosition.getX(), currentPosition.getY() + packet.params.value);
        });
    }

    getGroups() {
        return [];
    }
}

module.exports = MotionDriverController;
