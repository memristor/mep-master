'use strict';
/** @namespace services.terrain */

const Point = Mep.require("misc/geometry/Point");
const Polygon = Mep.require("misc/geometry/Polygon");
const PathFinding = require('./pathfinding/PathFinding');
const EventEmitter = require('events').EventEmitter;

const TAG = 'TerrainService';

/**
 * Class represent obstacles on the terrain and mechanism to search terrain between objects.
 * @memberOf services.terrain
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class TerrainService extends EventEmitter {
    init(config) {
        this.config = Object.assign({
            minX: -1500,
            maxX: 1500,
            minY: -1000,
            maxY: 1000,
            offset: 200,
            pfOffset: 50
        }, config);

        this.obstacles = [];
        this.pf = new PathFinding(
            1500 - this.config.offset,
            -1500 + this.config.offset,
            1000 - this.config.offset,
            -1000 + this.config.offset
        );

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
        Mep.DriverManager.callMethodByGroup('terrain', 'on', ['obstacleDetected', this._processObstacleDetection.bind(this)]);
    }

    _processObstacleDetection(source, relativePoi, polygon, detected) {
        let poi = relativePoi.clone();
        poi.rotateAroundZero(Mep.Position.getOrientation());
        poi.translate(Mep.Position.getPosition());

        // Process only if obstacle is in terrain
        if (poi.getX() < -1500 + this.config.offset ||
            poi.getX() > 1500 - this.config.offset ||
            poi.getY() < -1000 + this.config.offset ||
            poi.getY() > 1000 - this.config.offset) {
            return;
        }

        //let polygon = relativePolygon.clone();
        //polygon.rotate(new Point(0, 0), Mep.Position.getOrientation());
        polygon.rotateAroundZero(Mep.Position.getOrientation());
        polygon.translate(Mep.Position.getPosition());

        if (detected === true) {
            this.addObstacle(polygon);
            this.emit('obstacleDetected', {
                poi: poi,
                polygon: polygon,
                relativePoi: relativePoi
            });
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

    _getOffsetPoints(points) {
        if (points.length === 4) {
            let minX = points[0].getX();
            let minY = points[0].getY();
            let maxX = points[0].getX();
            let maxY = points[0].getY();
            for (let i = 1; i < 4; i++) {
                if (points[i].getX() > maxX) maxX = points[i].getX();
                if (points[i].getX() < minX) minX = points[i].getX();
                if (points[i].getY() > maxY) maxY = points[i].getY();
                if (points[i].getY() < minY) minY = points[i].getY();
            }
            return [
                new Point(minX - this.config.pfOffset, minY - this.config.pfOffset),
                new Point(maxX + this.config.pfOffset, minY - this.config.pfOffset),
                new Point(maxX + this.config.pfOffset, maxY + this.config.pfOffset),
                new Point(minX - this.config.pfOffset, maxY + this.config.pfOffset),
            ];
        }
        return points;
    }

    addObstacle(polygon) {
        let pathService = this;

        this.obstacles.push(polygon);

        let id = this.pf.addObstacle(this._getOffsetPoints(polygon.getPoints()));
        polygon.setId(id);

        //Mep.Log.debug(TAG, 'Obstacle Added', polygon);
        Mep.Telemetry.send(TAG, 'ObstacleAdded', polygon);

        if (polygon.getDuration() !== Infinity) {
            setTimeout(() => {
                pathService.removeObstacle(polygon.getId());
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
                //Mep.Log.debug(TAG, 'Obstacle Removed', id);
                Mep.Telemetry.send(TAG, 'ObstacleRemoved', { id: id });
                return true;
            }
        }
        return false;
    }
}

module.exports = TerrainService;