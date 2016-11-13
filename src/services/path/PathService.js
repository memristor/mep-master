const Point = Mep.require('types/Point');
const Polygon = Mep.require('types/Polygon');
const PathFinding = require('./pathfinding/PathFinding');
const driverManager = Mep.getDriverManager();

const TAG = 'PathService';

/**
 * Class represent obstacles on the path and mechanism to search path between objects.
 *
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class PathService {
    constructor(config) {
        this.obstacles = [];
        this.pf = new PathFinding(3000, 0, 1300, -800);

        this.processObstacleDetection.bind(this);

        // Add static obstacles
        for (let pointsArray of config.staticObstacles) {
            let points = [];
            for (let point of pointsArray) {
                points.push(new Point(point.x, point.y));
            }
            let polygon = new Polygon('static', 900 * 1000, points);

            this.addObstacle(polygon);
        }

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

    search(start, goal) {
        let points = [];
        let pointPairs = this.pf.search(start, goal);

        // Convert to `Array<Point>`
        for (let point of pointPairs) {
            points.push(new Point(point.x, point.y));
        }

        return points;
    }

    addObstacle(polygon) {
        let pathService = this;

        this.obstacles.push(polygon);
        let id = this.pf.addObstacle(polygon.getPoints());
        polygon.setId(id);

        Mep.Log.debug(TAG, 'Obstacle Added', polygon);

        setTimeout(() => {
            pathService.removeObstacle(id);
        }, polygon.getDuration());

        return id;
    }

    removeObstacle(id) {
        for (let i = 0; i < this.obstacles.length; i++) {
            if (this.obstacles[i].getId() === id) {
                // Remove from local list
                this.obstacles.splice(i, 1);

                // Try to remove from path finding algorithm
                this.pf.removeObstacle(id);
                Mep.Log.debug(TAG, 'Obstacle Removed', id);
                return true;
            }
        }
        return false;
    }
}

module.exports = PathService;