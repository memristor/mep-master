const TAG = 'MotionDriverController';

class MotionDriverController {
    constructor(name, config) {
        let motionDriver = Mep.getDriverManager().getDriver(config['@dependencies'].motionDriver);

        // Set X
        Mep.Telemetry.on(Mep.Telemetry.genOn(TAG, 'moveToPositionX'), (packet) => {
            let currentPosition = motionDriver.getPosition();
            motionDriver.moveToPosition(currentPosition.getX() + packet.params.value, currentPosition.getY());
        });

        // Set Y
        Mep.Telemetry.on(Mep.Telemetry.genOn(TAG, 'moveToPositionY'), (packet) => {
            let currentPosition = motionDriver.getPosition();
            motionDriver.moveToPosition(currentPosition.getX(), currentPosition.getY() + packet.params.value);
        });
    }

    getGroups() {
        return [];
    }
}

module.exports = MotionDriverController;
