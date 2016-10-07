/** @namespace types */

/**
 * Point in 2D space.
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