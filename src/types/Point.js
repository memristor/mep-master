/** @namespace types */

/**
 * Point in 2D space
 *
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 * @memberof types
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
     * @param point {Point} - Another point to compare with
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
        return point.getX() === this.getX() && point.getY() === this.getY();
    }

    /**
     * Translate point
     * @param translatePoint - x and y parameters for translation
     */
    translate(translatePoint) {
        this.x += translatePoint.getX();
        this.y += translatePoint.getY();
    }

    /**
     * Rotate point around origin point
     * @param originPoint - Origin point
     * @param angle - Rotation angle
     */
    rotate(originPoint, angleDegrees) {
        let angle = angleDegrees * (Math.PI / 180);
        this.x = Math.cos(angle) * (this.x - originPoint.getX()) - Math.sin(angle) * (this.y - originPoint.getY()) + originPoint.getX();
        this.y = Math.sin(angle) * (this.y - originPoint.getX()) + Math.cos(angle) * (this.y - originPoint.getY()) + originPoint.getY();
    }

    /**
     * Clone the point
     * @return {Point} - Cloned point
     */
    clone() {
        return new Point(this.x, this.y);
    }

    /**
     * Set Y coordinate
     * @param y {number} - Y coordinate
     */
    setY(y) {
        this.y = y;
    }

    /**
     * Set X coordinate
     * @param x {number} - X coordinate
     */
    setX(x) {
        this.x = x;
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
}

module.exports = Point;