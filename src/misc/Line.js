'use strict';
/** @namespace misc */

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


    /*
    _onSeg(xi, yi, xj, yj, xk, yk) {
        return (xi <= xk || xj <= xk) && (xk <= xi || xk <= xj) &&
            (yi <= yk || yj <= yk) && (yk <= yi || yk <= yj);
    }

    _dir(xi, yi, xj, yj, xk, yk) {
        let a = (xk - xi) * (yj - yi);
        let b = (xj - xi) * (yk - yi);
        return a < b ? -1 : a > b ? 1 : 0;
    }

    _intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        let d1 = this._dir(x3, y3, x4, y4, x1, y1);
        let d2 = this._dir(x3, y3, x4, y4, x2, y2);
        let d3 = this._dir(x1, y1, x2, y2, x3, y3);
        let d4 = this._dir(x1, y1, x2, y2, x4, y4);
        return (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
            ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) ||
            (d1 === 0 && this._onSeg(x3, y3, x4, y4, x1, y1)) ||
            (d2 === 0 && this._onSeg(x3, y3, x4, y4, x2, y2)) ||
            (d3 === 0 && this._onSeg(x1, y1, x2, y2, x3, y3)) ||
            (d4 === 0 && this._onSeg(x1, y1, x2, y2, x4, y4));
    }
    */
}

module.exports = Line;