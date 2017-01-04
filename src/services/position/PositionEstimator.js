const driverManager = Mep.getDriverManager();
const Point = Mep.require('types/Point');
const EventEmitter = require('events');

const TAG = 'PositionEstimator';

class PositionEstimator extends EventEmitter {
    constructor() {
        super();

        let positionEstimator = this;

        // Set default position
        this.point = new Point(0, 0);
        this.orientation = 0;

        this.processPositionChange.bind(this);

        // Subscribe on drivers
        this.drivers = driverManager.getDriversByGroup('position');
        for (let driverName in this.drivers) {
            // Position
            this.point = this.drivers[driverName].getPosition();
            this.drivers[driverName].on('positionChanged', (driverName, point, precision) => {
                positionEstimator.processPositionChange(driverName, point, precision);
            });

            // Orientation
            this.orientation = this.drivers[driverName].getOrientation();
            this.drivers[driverName].on('orientationChanged', (driverName, orientation, precision) => {
                positionEstimator.processOrientationChange(driverName, orientation, precision);
            });
        }
    }

    processPositionChange(driverName, point, precision) {
        // TODO: Sensor Fusion problem: https://en.wikipedia.org/wiki/Sensor_fusion
        // Implement Kalman filter: https://en.wikipedia.org/wiki/Kalman_filter

        Mep.Telemetry.send(TAG, 'PositionChanged', { point: point });

        this.emit('positionChanged', point);
        this.point = point;
    }

    processOrientationChange(driverName, orientation, precision) {
        Mep.Telemetry.send(TAG, 'OrientationChanged', { orientation: orientation });

        this.emit('orientationChanged', orientation);
        this.orientation = orientation;
    }

    getPosition() {
        return this.point;
    }

    getOrientation() {
        return this.orientation;
    }
}

module.exports = PositionEstimator;
