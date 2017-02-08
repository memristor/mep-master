const sinon = require('sinon');
const Point = Mep.require('misc/Point');
const Polygon = Mep.require('misc/Polygon');
const assert = require('assert');
const TunedPoint = Mep.require('strategy/TunedPoint');

describe('MotionServiceTest', () => {
    describe('#pathObstacleDetected', () => {
        let spy = sinon.spy();

        Mep.Motion.on('pathObstacleDetected', spy);

        let point = new Point(100, 0);
        let polygon = (new Polygon()).makeSquareAroundPoint(point, 50);
        Mep.Motion.go(new TunedPoint(200, 0));
        Mep.Motion._onObstacleDetected(point, polygon);
        it('should fire an event `pathObstacleDetected`', () => {
            assert(spy.args[0][0] === true);
        });

        point = new Point(500, 0);
        polygon = new Polygon().makeSquareAroundPoint(point, 100);
        Mep.Motion._onObstacleDetected(point, polygon);
        it('should not fire an event', () => {
            assert(spy.args[1] === undefined);
        });
    });
});
