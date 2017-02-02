'use strict';
/** @namespace services.terrain.pathfinding */

const PathFindingBinder = require('bindings')('pathfinding').PathFindingBinder;

class PathFinding extends PathFindingBinder {
    /**
     * @method addObstacle
     * @memberof services.terrain.pathfinding.PathFinding#
     * @param {Array<misc.Point>} points - Array of points that represent polygon
     * @return {Number} - ID of the obstacle
     */

    /**
     * @method removeObstacle
     * @memberof services.terrain.pathfinding.PathFinding#
     * @param {Number} id - ID of the obstacle
     */

    /**
     * @method search
     * @memberof services.terrain.pathfinding.PathFinding#
     * @param {misc.Point} start - Start point
     * @param {misc.Point} goal - Goal point
     * @return {Array<misc.Point>} - Array of pairs (x, y)
     */

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
