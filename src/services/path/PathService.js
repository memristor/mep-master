const Point = Mep.require('types/Point');
const Polygon = Mep.require('types/Polygon');
const driverManager = Mep.getDriverManager();

const TAG = 'PathService';

/**
 * Class represent obstacles on the path and mechanism to search path between objects.
 *
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class PathService {
    constructor() {
        this.obstacles = [];

        this.processObstacleDetection.bind(this);

        // Subscribe on drivers
        this.drivers = driverManager.getDataProviderDrivers('terrain');
        for (var driverName in this.drivers) {
            this.drivers[driverName].on('obstacleDetected', this.processObstacleDetection);
        }
    }

    processObstacleDetection(centerPoint, polygon, state) {
        if (state === 1) {
            this.addObstacle(polygon);

        } else {
            // TODO: Remove an obstacle
        }
    }

    addObstacle(polygon, addToPathFinding = true) {
        let that = this;

        // Add to local list
        this.obstacles.push(polygon);
        polygon.setId(1);

        // Remove obstacle after timeout
        setTimeout(() => {
            that.removeObstacle(polygon.getId());
        }, polygon.getDuration());

        return 1;
    }

    removeObstacle(id) {
        for (let i = 0; i < this.obstacles.length; i++) {
            if (this.obstacles[i].getId() === id) {
                // Remove from local list
                this.obstacles.splice(i, 1);

                // Try to remove from path finding algorithm
                // TODO: pf.remove...

                return true;
            }
        }

        return false;
    }
}

module.exports = PathService;