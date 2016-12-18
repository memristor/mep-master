const driverManager = Mep.getDriverManager();
const Point = Mep.require('types/Point');
const EventEmitter = require('events');

const TAG = 'PositionEstimator';

class PositionEstimator extends EventEmitter {
    constructor() {
        super();

        let object = this;

        // Set default position
        this.point = new Point(0, 0);

        this.processPositionChange.bind(this);

        // Subscribe on drivers
        this.drivers = driverManager.getDriversByGroup('position');
        for (let driverName in this.drivers) {
            this.drivers[driverName].on('positionChanged', (driverName, point, precision) => {
                object.processPositionChange(driverName, point, precision);
            });
        }
    }

    processPositionChange(driverName, point, precision) {
        // TODO: Sensor Fusion problem: https://en.wikipedia.org/wiki/Sensor_fusion
        // Implement Kalman filter: https://en.wikipedia.org/wiki/Kalman_filter

        Mep.TM(TAG, 'ReceivedPosition', {driverName: driverName, point: point});
        Mep.Log.debug(TAG, 'Received position from', driverName, point);

        this.emit('positionChanged', point);
        this.point = point;
    }

    getPosition() {
        return this.point;
    }
}

module.exports = PositionEstimator;
