const assert = require('assert');
const TunedPoint = Mep.require('strategy/TunedPoint');

describe('TunedPoint', () => {
    let tunedPoint;

    tunedPoint = new TunedPoint(10, 30, [11, 31, 'ccc']);
    it('should return a point with x = 10 and y = 30', () => {
        let point = tunedPoint.getPoint();
        assert(point.getX() === 10);
        assert(point.getY() === 30);
    });
});