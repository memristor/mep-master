const should = require('should');
const Point = require('../src/types/Point');

describe('Point', function () {
    let point = new Point(100, 200);
    let anotherPoint = new Point(100, 200);

    it('should be equal', () => {
        point.equals(anotherPoint).should.equal(true);
    });

    it('should be equal after clone', () => {
        anotherPoint.setX(10);
        anotherPoint.setY(20);
        point.clone(anotherPoint);

        point.equals(anotherPoint).should.equal(true);
    });
});