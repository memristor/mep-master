const driverManager = Mep.getDriverManager();
const Point = Mep.require('types/Point');

const TAG = 'PositionEstimator';

class PositionEstimator {
    constructor(config) {
        this.config = Object.assign({
            positionChangedCallback: (() => {}),
            orientationChangedCallback: (() => {}),
        }, config);

        // Set default position
        this.point = driverManager.getDriver('MotionDriver').getPosition();
        this.orientation = driverManager.getDriver('MotionDriver').getOrientation();

        // Subscribe on drivers
        driverManager.callMethodByGroup('position', 'on', ['positionChanged', this.processPositionChange.bind(this)]);
        driverManager.callMethodByGroup('position', 'on', ['orientationChanged', this.processOrientationChange.bind(this)]);

        // Initial publish
        Mep.Telemetry.send(TAG, 'PositionChanged', this.point);
        Mep.Telemetry.send(TAG, 'OrientationChanged', { orientation: this.orientation });
    }

    processPositionChange(driverName, point, precision) {
        // TODO: Sensor Fusion problem: https://en.wikipedia.org/wiki/Sensor_fusion
        // Implement Kalman filter: https://en.wikipedia.org/wiki/Kalman_filter
        Mep.Log.debug(TAG, point);

        this.point = point;
        this.config.positionChangedCallback(point);

        Mep.Telemetry.send(TAG, 'PositionChanged', point);
    }

    processOrientationChange(driverName, orientation, precision) {
        this.orientation = orientation;
        this.config.orientationChangedCallback(orientation);

        Mep.Telemetry.send(TAG, 'OrientationChanged', { orientation: orientation });
    }

    getPosition() {
        return this.point;
    }

    getOrientation() {
        return this.orientation;
    }
}

module.exports = PositionEstimator;
