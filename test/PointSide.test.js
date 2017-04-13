const assert = require('assert');
const Point = Mep.require('misc/Point');
const Line = Mep.require('misc/Line');

describe('Point side test', () => {
  let point11 = new Point(100, 200);
  let point12 = new Point(100, 300);
  let line = new Line(point11, point12);
  let refferentPoint = new Point(200, 200);
  let testingPoint = new Point(200, 300);
  it('same sides parallel', ()=>{
    assert(testingPoint.isSameSide(line, refferentPoint) === true);
  });
  it('different sides', ()=>{
    testingPoint.setX(50);
    testingPoint.setY(250);
    assert(testingPoint.isSameSide(line, refferentPoint) === false);
  });
  it('same side, direction towards line', ()=>{
    testingPoint.setX(300);
    testingPoint.setY(200);
    assert(testingPoint.isSameSide(line, refferentPoint) === true);
  });
});
