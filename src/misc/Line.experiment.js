const Line = require('./Line');
const Point = require('./Point');

let a = new Line(new Point(0, 0), new Point(100, 100));
let b = new Line(new Point(0, 100), new Point(100, 0));

console.log(a.findIntersectionWithLine(b));