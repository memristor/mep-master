const should = require('should');
const sinon = require('sinon');
const Point = Mep.require('types/Point');
const assert = require('assert');

describe('PositionServiceTest', () => {
    describe('#pathObstacleDetected', () => {
        let spy = sinon.spy();
        Mep.getPositionService().on('pathObstacleDetected', spy);

        Mep.getPositionService()._onPathObstacleDetected('Infrared', new Point(300, 0), true, true);
        it('should fire an event `pathObstacleDetected`', () => {
            spy.args[0][0].should.be.equal(true);
        });

        Mep.getPositionService()._onPathObstacleDetected('Infrared', new Point(300, 0), false, true);
        it('should delete detected obstacle', () => {
            spy.args[1][0].should.be.equal(false);
        });


        Mep.getPositionService()._onPathObstacleDetected('Infrared', new Point(4000, 0), true, true);
        it('should not fire an event', () => {
            assert(spy.args[2] === undefined);
        });
    });
});
