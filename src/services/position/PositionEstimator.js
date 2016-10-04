const driverManager = Mep.require('drivers/DriverManager').get();
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
        // TODO: Here we need some complex algorithm to synthesize data from multiple sensors
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
