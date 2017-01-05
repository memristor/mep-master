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
        anotherPoint = point.clone();

        point.equals(anotherPoint).should.equal(true);
    });

    it('should be 4*sqrt(2) for rotation -45 degrees', () => {
        point.setX(4);
        point.setY(4);
        point.rotate(new Point(0, 0), -45);

        (+point.getY().toFixed(2)).should.equal(0);
        (+point.getX().toFixed(2)).should.equal((+(4 * Math.sqrt(2)).toFixed(2)));
    });
});