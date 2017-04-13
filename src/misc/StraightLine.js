'use strict';
/** @namespace misc */

const Point = require('./Point');

/**
 * Straihgt line in 2D space
 * Determined by equation A * x + B * y = C
 * @memberof misc
 */
class StraightLine {

  /**
   * @param firstPoint {misc.Point}
   * @param secondPoint {misc.Point}
   * Order is irrelevant.
   */
  constructor(firstPoint, secondPoint){
      let A = secondPoint.getY() - firstPoint.getY();
      let B = firstPoint.getX() - secondPoint.getX();
      let C = A * firstPoint.getX() + B * firstPoint.getY();
      this._A = A;
      this._B = B;
      this._C = C;
  }

  getA(){
      return this._A;
  }

  getB(){
      return this._B;
  }

  getC(){
      return this._C;
  }

  /**
   * @param straightLine {StraightLine}
   * @return {Point} - If lines intersect, else return undefined
   */
  isIntersectWithStraightLine(straightLine){
    let A1 = this.getA();
    let A2 = straightLine.getA();
    let B1 = this.getB();
    let B2 = straightLine.getB();
    let C1 = this.getC();
    let C2 = straightLine.getC();
    let det = A1*B2 - A2*B1;
    if(Math.abs(det) < 0.01){
        return undefined;
    }else{
        let x = (B2*C1 - B1*C2)/det;
        let y = (A1*C2 - A2*C1)/det;
        return new Point(x,y);
    }
  }
}

module.exports = StraightLine;
