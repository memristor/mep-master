const sinon = require('sinon');
const Point = Mep.require('misc/Point');
const assert = require('assert');

describe('PositionServiceTest', () => {
    describe('#pathObstacleDetected', () => {
        let spy = sinon.spy();
        Mep.Motion.on('pathObstacleDetected', spy);
        Mep.Motion._direction = Mep.Motion.DIRECTION_FORWARD;

        Mep.Motion._onPathObstacleDetected('Infrared', new Point(300, 0), true, true);
        it('should fire an event `pathObstacleDetected`', () => {
            assert(spy.args[0][0] === true);
        });

        Mep.Motion._onPathObstacleDetected('Infrared', new Point(300, 0), false, true);
        it('should delete detected obstacle', () => {
            assert(spy.args[1][0] === false);
        });


        Mep.Motion._onPathObstacleDetected('Infrared', new Point(4000, 0), true, true);
        it('should not fire an event', () => {
            assert(spy.args[2] === undefined);
        });
    });
});
