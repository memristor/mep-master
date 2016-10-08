const driverManager = Mep.getDriverManager();
const Point = Mep.require('types/Point');
const EventEmitter = require('events');

const TAG = 'PositionEstimator';

class PositionEstimator extends EventEmitter {
    constructor() {
        super();

        // Set default position
        this.point = new Point(0, 0);

        // Subscribe on drivers
        this.drivers = driverManager.getDataProviderDrivers('position');

        for (var driverName in this.drivers) {
            this.drivers[driverName].on('positionChanged', this.processPositionChange);
        }
    }

    processPositionChange(driverName, x, y, precision) {
        // TODO: Sensor Fusion problem: https://en.wikipedia.org/wiki/Sensor_fusion
        // Implement Kalman filter: https://en.wikipedia.org/wiki/Kalman_filter

        Mep.Log.debug(TAG, 'Received position from', driverName, '(' + x + ', ' + y + ')');
        this.point.setX(x);
        this.point.setY(y);

        this.emit('positionChanged', new Point(x, y));
    }

    getPosition() {
        return this.point();
    }
}

module.exports = PositionEstimator;
