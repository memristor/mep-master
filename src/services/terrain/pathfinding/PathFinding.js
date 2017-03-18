'use strict';
/** @namespace services.terrain.pathfinding */

const PathFindingBinder = require('bindings')('pathfinding').PathFindingBinder;
const Point = Mep.require('misc/Point');

let TAG = 'Pathfinding';

class PathFinding extends PathFindingBinder {
    /**
     * @method addObstacle
     * @memberof services.terrain.pathfinding.PathFinding#
     * @param {Array<misc.Point>} points - Array of points that represent polygon
     * @return {Number} - ID of the obstacle
     */
    // addObstacle(points) { return super.addObstacle(points); }

    /**
     * @method removeObstacle
     * @memberof services.terrain.pathfinding.PathFinding#
     * @param {Number} id - ID of the obstacle
     */
    // removeObstacle(id) { super.removeObstacle(id); }

    /**
     * @method search
     * @memberof services.terrain.pathfinding.PathFinding#
     * @param {misc.Point} start - Start point
     * @param {misc.Point} goal - Goal point
     * @return {Array<misc.Point>} - Array of pairs (x, y)
     */
    // search(start, goal) { return super.search(start, goal); }

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
