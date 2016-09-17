/** @namespace types */

const Point = require('./Point');

/**
 * Tunable Point. Point coordinates are choose depends on table name in configuration.
 * @memberof types
 * @example
 * new TunePoint(
 *      new Point(150, 129),
 *      new Point(151, 129, 'table_1'),
 *      new Point(148, 128, 'table_2')
 * );
 */
class TunedPoint {
    /**
     * Add multiple Points, add Points for each table. It must has
     * at least one Point which will be used as default. Other Points
     * must have tag!
     *
     * @param defaultPoint {Point} - Default point
     */
    constructor(defaultPoint) {
        // If there are table dependent points
        for (let i = 1; i < arguments.length; i++) {
            if (Mep.Config.get('Table') == arguments[i].getTag()) {
                this.point = arguments[i];
            }
        }

        if (typeof this.point === 'undefined') {
            this.point = defaultPoint;
        }
    }

    /**
     * Get point depending on the choosen table in configuration.
     *
     * @returns {Point} - Point
     */
    getPoint() {
        return this.point;
    }
}

module.exports = TunedPoint;
