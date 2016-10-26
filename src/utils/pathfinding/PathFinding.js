const PathFindingBinder = require('bindings')('pathfinding').PathFindingBinder;

class PathFinding extends PathFindingBinder {
    constructor(maxX, minX, maxY, minY) {
        super(maxX, minX, maxY, minY);
    }

    getMatrix() {
        // getAllObstacles
        // use Polygon to convert to 
    }
}

var pf = new PathFinding(0, 0, 3000, 2000);
