const PathFindingBinder = require('bindings')('pathfinding').PathFindingBinder;

class PathFinding extends PathFindingBinder {
    /**
     * @method addObstacle
     * @memberof PathFinding#
     * @param {Array} points - Array of points that represent polygon
     * @return {Number} - ID of the obstacle
     */

    /**
     * @method removeObstacle
     * @memberof PathFinding#
     * @param {Number} id - ID of the obstacle
     */

    /**
     * @method search
     * @memberof PathFinding#
     * @param {Point} start - Start point
     * @param {Point} goal - Goal point
     * @return {Array} - Array of pairs (x, y)
     */

    /**
     * Creates path finding algorithm for an area
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
