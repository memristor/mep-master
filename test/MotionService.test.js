const Point = Mep.require('misc/geometry/Point');
const Polygon = Mep.require('misc/geometry/Polygon');
const assert = require('assert');
const TunedPoint = Mep.require('strategy/TunedPoint');

describe('MotionServiceTest', () => {
    describe('#pathObstacleDetected', () => {
        let point = new Point(150, 0);
        let polygon = (new Polygon()).makeSquareAroundPoint(point, 100);

        it('should fire an exception with type `TaskError.action` === \'obstacle\'', (done) => {
            Mep.Motion.go(new TunedPoint(200, 0)).then(done).catch((e) => {
                if (e.action === 'obstacle') {
                    done();
                }
            });
            Mep.Motion._onObstacleDetected({
                poi: point,
                relativePoi: point,
                polygon: polygon
            });
        });
    });
});
