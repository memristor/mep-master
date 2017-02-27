const sinon = require('sinon');
const Point = Mep.require('misc/Point');
const Polygon = Mep.require('misc/Polygon');
const assert = require('assert');
const TunedPoint = Mep.require('strategy/TunedPoint');

describe('MotionServiceTest', () => {
    describe('#pathObstacleDetected', () => {
        let spy = sinon.spy();
        let point = new Point(100, 0);
        let polygon = (new Polygon()).makeSquareAroundPoint(point, 50);



        before((done) => {
                Mep.Motion.on('pathObstacleDetected', spy);
                Mep.Motion.go(new TunedPoint(200, 0));
                Mep.Motion._onObstacleDetected(point, polygon);
                done();
        });

        it('should fire an event `pathObstacleDetected`', (done) => {
            assert(spy.args[0][0] === true);
            done();
        });


        before((done) => {
            point = new Point(500, 0);
            polygon = new Polygon().makeSquareAroundPoint(point, 100);
            Mep.Motion._onObstacleDetected(point, polygon);
            return done();
        });

        it('should not fire an event', (done) => {
            assert(spy.args[1] === undefined);
            done();
        });
    });
});
