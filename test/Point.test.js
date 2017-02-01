const assert = require('assert');
const Point = Mep.require('misc/Point');

describe('Point', () => {
    let point = new Point(100, 200);
    let anotherPoint = new Point(100, 200);

    it('should be equal', () => {
        assert(point.equals(anotherPoint) === true);
    });

    it('should be equal after clone', () => {
        anotherPoint.setX(10);
        anotherPoint.setY(20);
        anotherPoint = point.clone();

        assert(point.equals(anotherPoint) === true);
    });

    it('should be 4*sqrt(2) for rotation -45 degrees', () => {
        point.setX(4);
        point.setY(4);
        point.rotate(new Point(0, 0), -45);

        assert(+point.getY().toFixed(2) === 0);
        assert(+point.getX().toFixed(2) === +(4 * Math.sqrt(2)).toFixed(2));
    });
});