'use strict';
/** @namespace misc */

const Point = require('./Point');

/**
 * Line in 2D space
 * @memberof misc
 */
class Line {
    /**
     * @param startPoint {misc.Point} - Start point of the line
     * @param endPoint {misc.Point} - End point of the line
     */
    constructor(startPoint, endPoint) {
        this._startPoint = startPoint;
        this._endPoint = endPoint;
    }

    /**
     * Get start point
     * @return {misc.Point}
     */
    getStartPoint() {
        return this._startPoint;
    }

    /**
     * Get end point
     * @return {misc.Point}
     */
    getEndPoint() {
        return this._endPoint;
    }

    /**
     * Check if it intersect with another line
     * @param line {misc.Line} - Another line to check intersection with
     * @return {Boolean} - True if two lines intersect
     */
    isIntersectWithLine(line) {
        return this._intersect(
            line.getStartPoint().getX(),
            line.getStartPoint().getY(),
            line.getEndPoint().getX(),
            line.getEndPoint().getY(),
            this._startPoint.getX(),
            this._startPoint.getY(),
            this._endPoint.getX(),
            this._endPoint.getY()
        );
    }

    // Reference: http://stackoverflow.com/a/40953705/1983050
    findIntersectionWithLine(line) {
        let slopeA = (this._startPoint.getY() - this._endPoint.getY()) / (this._startPoint.getX() - this._endPoint.getX());  // slope of line 1
        let slopeB = (line._startPoint.getY() - line._endPoint.getY()) / (line._startPoint.getX() - line._endPoint.getX());  // slope of line 2

        if ( slopeA - slopeB < Number.EPSILON) {
            return undefined;
        } else {
            return new Point(
                (slopeA * this._startPoint.getX() - slopeB * line._startPoint.getX() + line._startPoint.getY() - this._startPoint.getY()) / (slopeA - slopeB),
                (slopeA * slopeB * (line._startPoint.getX() - this._startPoint.getX()) + slopeB * this._startPoint.getY() - slopeA * line._startPoint.getY()) / (slopeB - slopeA)
            );
        }
    }

    findIntersectionWithPolygon(polygon) {
        for (let i = 0; i < polygon.getPoints().length - 1; i++) {
            let intersection = this.findIntersectionWithLine(new Line(
                    polygon.getPoints()[i],
                    polygon.getPoints()[i + 1]
                ));
            if (intersection !== undefined) {
                return intersection;
            }
        }
        return undefined;
    }


    /**
     * Check if it intersect with polygon
     * @param polygon {misc.Polygon} - Polygon to check intersection with
     * @returns {Boolean} - True if line intersect polygon
     */
    isIntersectWithPolygon(polygon) {
        for (let i = 0; i < polygon.getPoints().length - 1; i++) {
            if (this.isIntersectWithLine(new Line(
                polygon.getPoints()[i],
                polygon.getPoints()[i + 1]
            )) === true) {
                return true;
            }
        }
        return false;
    }

    // Reference: https://gist.github.com/Joncom/e8e8d18ebe7fe55c3894
    _intersect(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {
        let s1_x, s1_y, s2_x, s2_y;
        s1_x = p1_x - p0_x;
        s1_y = p1_y - p0_y;
        s2_x = p3_x - p2_x;
        s2_y = p3_y - p2_y;

        let s, t;
        s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
        t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

        return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
    }


}

module.exports = Line;