global.Mep = require('../../../Mep');
const Point = Mep.require('misc/Point');
const Polygon = Mep.require('misc/Polygon');
const PathFinding = require('./PathFinding');

var pf = new PathFinding(2000, 0, 3000, 0);

let points = [
    new Point(1, 1),
    new Point(100, 1),
    new Point(100, 100),
    new Point(1, 100)
];
let polygon = new Polygon('test', Infinity, points);

let id = pf.addObstacle(polygon.getPoints(), () => {});

setInterval(() => {
    let timeStart = process.hrtime();
    pf.addObstacle(polygon.getPoints(), (id) => {
        console.log(id)
    });
    //Buffer.alloc(1);
    let timerEnd = process.hrtime(timeStart)[1] / 1000;
    console.log('Time took', timerEnd);
}, 500);
return;

console.log(ret);

pf.removeObstacle(id);
ret = pf.search(new Point(0, 0), new Point(101, 101));
console.log(ret);
