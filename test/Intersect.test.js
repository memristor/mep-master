const assert = require('assert');
const Point = Mep.require('misc/Point');
const Line = Mep.require('misc/Line')

describe('Lines', () => {
  let point11 = new Point(100, 200);
  let point12 = new Point(100, 300);
  let line1 = new Line(point11, point12);
  let point21 = new Point(200, 200);
  let point22 = new Point(200, 300);
  let line2 = new Line(point21, point22);
   it('should be parallel', ()=>{
     assert(line1.isIntersectWithLine(line2) === undefined);
   });
  it('intersect normally', ()=>{
    point21.setX(50);
    point21.setY(250);
    point22.setX(150);
    point22.setY(250);
    line2 = new Line(point21, point22);
    let finalPoint = line1.isIntersectWithLine(line2);
    assert(finalPoint.equals(new Point(100, 250)));
  });
  it('really close', ()=>{
    point21.setX(101);
    point21.setY(200);
    point22.setX(101);
    point22.setY(300);
    line2 = new Line(point21, point22);
    assert(line1.isIntersectWithLine(line2) === undefined);
  });
  it('intersect some angle', ()=>{
    point21.setX(50);
    point21.setY(180);
    point22.setX(150);
    point22.setY(250);
    line2 = new Line(point21, point22);
    let finalPoint = line1.isIntersectWithLine(line2);
    assert(finalPoint.equals(new Point(100, 215)));
  });
  // it('Collinear points FAIL', ()=>{
  //   point21.setX(100);
  //   point21.setY(100);
  //   point22.setX(100);
  //   point22.setY(201);
  //   line2 = new Line(point21, point22);
  //   console.log(line1);
  //   console.log(line2);
  //   console.log(line1.isIntersectWithLine(line2));
  //   assert(line1.isIntersectWithLine(line2) !== undefined);
  // });

});
