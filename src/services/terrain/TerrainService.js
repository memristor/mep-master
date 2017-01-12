const Point = Mep.require('types/Point');
const Polygon = Mep.require('types/Polygon');
const PathFinding = require('./pathfinding/PathFinding');
const driverManager = Mep.getDriverManager();

const TAG = 'TerrainService';

/**
 * Class represent obstacles on the terrain and mechanism to search terrain between objects.
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class TerrainService {
    init(config) {
        this.obstacles = [];
        this.pf = new PathFinding(1500, -1500, 1000, -1000);

        this.processObstacleDetection.bind(this);

        // Add static obstacles
        for (let pointsArray of config.staticObstacles) {
            let points = [];
            for (let point of pointsArray) {
                points.push(new Point(point.x, point.y));
            }
            let polygon = new Polygon('static', Infinity, points);

            this.addObstacle(polygon);
        }

        // Subscribe on drivers
        driverManager.callMethodByGroup('terrain', 'on', ['obstacleDetected', this.processObstacleDetection.bind(this)]);
    }

    processObstacleDetection(centerPoint, relativePolygon, detected) {
        let polygon = relativePolygon.clone();
        polygon.rotate(new Point(0, 0), Mep.getPositionService().getOrientation());
        polygon.translate(Mep.getPositionService().getPosition());

        if (detected === true) {
            this.addObstacle(polygon);

        } else {
            // TODO: Remove an obstacle
        }
    }

    findPath(start, goal) {
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
        Mep.Telemetry.send(TAG, 'ObstacleAdded', polygon);

        if (polygon.getDuration() !== Infinity) {
            setTimeout(() => {
                pathService.removeObstacle(id);
            }, polygon.getDuration());
        }

        return id;
    }

    removeObstacle(id) {
        for (let i = 0; i < this.obstacles.length; i++) {
            if (this.obstacles[i].getId() === id) {
                // Remove from local list
                this.obstacles.splice(i, 1);

                // Try to remove from terrain finding algorithm
                this.pf.removeObstacle(id);
                Mep.Log.debug(TAG, 'Obstacle Removed', id);
                Mep.Telemetry.send(TAG, 'ObstacleRemoved', { id: id });
                return true;
            }
        }
        return false;
    }
}

module.exports = TerrainService;