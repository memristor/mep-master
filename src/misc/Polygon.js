'use strict';

/** @namespace misc */

const Point = Mep.require('misc/Point');

/**
 * Describes an polygon
 * @see https://en.wikipedia.org/wiki/Polygon
 * @memberOf misc
 */
class Polygon {
    /**
     * @param tag {String} - Additional information about polygon to describe it
     * @param duration {Number} - Polygon will be destroyed after given number of milliseconds
     * @param points {Array<misc.Point>} - Array of points which can describe an polygon
     */
    constructor(tag, duration, points) {
        // Check points
        if (points !== undefined && points.length < 3) {
            let msg = 'Polygon requires at least 3 points';
            Mep.Log.error(TAG, msg);
            throw Error(msg);
        }

        // Store values
        this.duration = duration;
        this.tag = tag;
        this.points = points;
        this.id = null;
    }

    makeSquareAroundPoint(centerPoint, sideSize) {
        this.points = [
            new Point(centerPoint.getX() - sideSize / 2, centerPoint.getY() - sideSize / 2),
            new Point(centerPoint.getX() + sideSize / 2, centerPoint.getY() - sideSize / 2),
            new Point(centerPoint.getX() + sideSize / 2, centerPoint.getY() + sideSize / 2),
            new Point(centerPoint.getX() - sideSize / 2, centerPoint.getY() + sideSize / 2),
        ];
        return this;
    }

    setId(id) {
        this.id = id
        return this;
    }

    getId() {
        return this.id;
    }

    /**
     * Translate all points of polygon
     * @param translatePoint {misc.Point} Point which represents x and y value of translation
     */
    translate(translatePoint) {
        for (let point of this.points) {
            point.translate(translatePoint);
        }
        return this;
    }

    /**
     * Rotate all points of polygon around an origin point
     * @param originPoint {misc.Point} Center point of rotation
     * @param angleDegrees {Number} Required angle of rotation
     */
    rotate(originPoint, angleDegrees) {
        for (let point of this.points) {
            point.rotate(originPoint, angleDegrees)
        }
        return this;
    }

    /**
     * @returns {Array<misc.Point>} Get an array of points which describe a polygon
     */
    getPoints() {
        return this.points;
    }

    /**
     * @returns {Number} Get duration of milliseconds after the polygon will be destroyed
     */
    getDuration() {
        return this.duration;
    }

    /**
     * @returns {String} Get unique identifier of polygon
     */
    getTag() {
        return this.tag;
    }

    /**
     * Clone a polygon
     * @returns {misc.Polygon} Cloned polygon
     */
    clone() {
        let points = [];
        for (let point of this.points) {
            points.push(point.clone());
        }
        return new Polygon(this.tag, this.duration, points);
    }
}

module.exports = Polygon;