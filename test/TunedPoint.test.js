global.Mep = require('../src/Mep');
const should = require('should');
const TunedPoint = require('../src/types/TunedPoint');

describe('TunedPoint', function () {
    let tunedPoint;

    tunedPoint = new TunedPoint(10, 30, [11, 31, 'ccc']);
    it('should return a point with x = 10 and y = 30', function () {
        let point = tunedPoint.getPoint();
        point.getX().should.equal(10);
        point.getY().should.equal(30);
    });
});