global.Mep = require('../../Mep');
const Point = Mep.require('misc/Point');
const Polygon = Mep.require('misc/Polygon');

Mep.init(() => {
    let points = [
        new Point(0, 0),
        new Point(100, 0),
        new Point(100, 100),
        new Point(0, 100)
    ];
    Mep.Motion._targetQueue.addPointBack(new Point(0, 0), {});

    let angle = 0;
    setInterval(() => {
        let polygon = new Polygon('Test', Infinity, points);
        Mep.Motion._onObstacleDetected(new Point(-1200, 0), polygon);
        polygon.rotate(new Point(0, 0), angle++);
    }, 500);
});
