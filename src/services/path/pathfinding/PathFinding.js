global.Mep = require('../../../Mep');
const Point = Mep.require('types/Point');
const PathFindingBinder = require('bindings')('pathfinding').PathFindingBinder;

class PathFinding extends PathFindingBinder {
    /**
     * @method addObstacle
     * @memberof PathFinding#
     * @param {Array} points - Array of points that represent polygon
     */

    constructor(maxX, minX, maxY, minY) {
        super(maxX, minX, maxY, minY);
    }


    getMatrix() {
        // getAllObstacles
        // use Polygon to convert to 
    }
}

var pf = new PathFinding(2000, 0, 3000, 0);
let id = pf.addObstacle([
    new Point(1, 1),
    new Point(100, 1),
    new Point(100, 100),
    new Point(1, 100)
]);

let ret = pf.search(new Point(0, 0), new Point(101, 101));

console.log(ret);

