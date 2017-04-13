'use strict';
/** @namespace misc */



/**
 * Point in 2D space
 *
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 * @memberOf misc
 */
class Point {
    /**
     * Make new point.
     * @param x {number} - x coordinate
     * @param y {number} - y coordinate
     * @param tag {string} - Option parameter. It is used to determine to which table point belongs.
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Calculate Euclidean distance between two Points
     * @param point {misc.Point} - Another point to compare with
     * @returns {number} - Distance between two Points
     */
    getDistance(point) {
        return Math.sqrt(
            Math.pow((point.getX() - this.x), 2) +
            Math.pow((point.getY() - this.y), 2)
        );
    }

    /**
     * Check if points are equal
     * @param point {Point} - Another point to be compared
     * @returns {boolean}
     */
    equals(point) {
        return (point.getX() === this.getX() && point.getY() === this.getY());
    }

    /**
     * Translate point
     * @param translatePoint - x and y parameters for translation
     */
    translate(translatePoint) {
        this.x += translatePoint.getX();
        this.y += translatePoint.getY();
        return this;
    }

    /**
     * Rotate point around origin point
     * @param originPoint {misc.Point} - Origin point
     * @param angleDegrees {Number} - Rotation angle
     * @returns {misc.Point}
     */
    rotate(originPoint, angleDegrees) {
        let angle = angleDegrees * (Math.PI / 180);

        let x = Math.cos(angle) * (this.x - originPoint.getX()) - Math.sin(angle) * (this.y - originPoint.getY()) + originPoint.getX();
        let y = Math.sin(angle) * (this.x - originPoint.getX()) + Math.cos(angle) * (this.y - originPoint.getY()) + originPoint.getY();
        this.x = x | 0;
        this.y = y | 0;

        return this;
    }

    /**
     * Optimized algorithm for point rotation around coordinate beginning
     * @param angleDegrees {Number}
     * @returns {misc.Point}
     */
    rotateAroundZero(angleDegrees) {
        let angle = angleDegrees * (Math.PI / 180);

        let x = Math.cos(angle) * this.x - Math.sin(angle) * this.y;
        let y = Math.sin(angle) * this.x + Math.cos(angle) * this.y;
        this.x = x | 0;
        this.y = y | 0;

        return this;
    }

    /**
     * Clone the point
     * @return {misc.Point} - Cloned point
     */
    clone() {
        return (new Point(this.x, this.y));
    }

    /**
     * Set Y coordinate
     * @param y {number} - Y coordinate
     */
    setY(y) {
        this.y = y;
        return this;
    }

    /**
     * Set X coordinate
     * @param x {number} - X coordinate
     */
    setX(x) {
        this.x = x;
        return this;
    }

    /**
     * Return x coordinate
     * @returns {number}
     */
    getX() {
        return this.x;
    }

    /**
     * Returns y coordinate
     * @returns {number}
     */
    getY() {
        return this.y;
    }

    /**
    * Check if this point is on the same side of line segment as refferent point
    * Algorithm: replace line with straight line and create straight line from
    * this and refferent point. Find intersection of those lines and check if it
    * belongs to line segment created from this and refferent point.
    * @param line {Line}
    * @param refferentPoint {Point}
    * @returns {boolean}
    */
    isSameSide(line, refferentPoint){
        const StraightLine = require('./StraightLine');
        let straightLineFromSegment = new StraightLine(line.getStartPoint(), line.getEndPoint());
        let straightLineFromPoints = new StraightLine(this.clone(), refferentPoint);
        let intersectionResult = straightLineFromPoints.isIntersectWithStraightLine(straightLineFromSegment);
        if(intersectionResult === undefined){
            return true;
        }else{
          //Reference: http://stackoverflow.com/a/328193
          let addition = this.getDistance(intersectionResult) + refferentPoint.getDistance(intersectionResult);
          return  Math.abs(addition - this.getDistance(refferentPoint)) > 0.01;
        }
    }
}


module.exports = Point;
