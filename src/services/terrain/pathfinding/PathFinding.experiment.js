global.Mep = require('../../../Mep');
const Point = Mep.require('types/Point');
const PathFinding = require('./PathFinding');

var pf = new PathFinding(2000, 0, 3000, 0);
let id = pf.addObstacle([
    new Point(1, 1),
    new Point(100, 1),
    new Point(100, 100),
    new Point(1, 100)
]);

let ret = pf.search(new Point(0, 0), new Point(101, 101));
console.log(ret);

pf.removeObstacle(id);
ret = pf.search(new Point(0, 0), new Point(101, 101));
console.log(ret);
