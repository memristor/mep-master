'use strict';
/** @namespace services.terrain.pathfinding */

const PathFindingBinder = require('bindings')('pathfinding').PathFindingBinder;
const Point = Mep.require('misc/Point');

let debug = false;
let TAG = 'Pathfinding';

class PathFinding extends PathFindingBinder {
    /**
     * @method addObstacle
     * @memberof services.terrain.pathfinding.PathFinding#
     * @param {Array<misc.Point>} points - Array of points that represent polygon
     * @return {Number} - ID of the obstacle
     */
    addObstacle(points) {
        this.config = {
            volume: 50
        };

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
            points = [
                new Point(minX - this.config.volume, minY - this.config.volume),
                new Point(maxX + this.config.volume, minY - this.config.volume),
                new Point(maxX + this.config.volume, maxY + this.config.volume),
                new Point(minX - this.config.volume, maxY + this.config.volume),
            ];
        }

        return super.addObstacle(points);
    }

    /**
     * @method removeObstacle
     * @memberof services.terrain.pathfinding.PathFinding#
     * @param {Number} id - ID of the obstacle
     */
    removeObstacle(id) {
        if (debug === true) {
            console.log(TAG, 'removeObstacle', id);
        }
        super.removeObstacle(id);
    }

    /**
     * @method search
     * @memberof services.terrain.pathfinding.PathFinding#
     * @param {misc.Point} start - Start point
     * @param {misc.Point} goal - Goal point
     * @return {Array<misc.Point>} - Array of pairs (x, y)
     */
    search(start, goal) {
        let result = super.search(start, goal);
        if (debug === true) {
            console.log(TAG, 'search', start, goal);
            console.log(TAG, 'search = ', result);
        }
        return result;
    }

    /**
     * Creates terrain finding algorithm for an area
     * @param maxX {Number} - Maximal value of X coordinate
     * @param minX {Number} - Minimal value of X coordinate
     * @param maxY {Number} - Maximal value of Y coordinate
     * @param minY {Number} - Minimal value of Y coordinate
     */
    constructor(maxX, minX, maxY, minY) {
        super(maxX, minX, maxY, minY);
    }
}

module.exports = PathFinding;
