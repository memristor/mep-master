/** @namespace strategy */

const Point = Mep.require('misc/Point');

const TAG = 'TunedPoint';

/**
 * Tunable Point. Point coordinates are choose depends on table name in configuration.
 *
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 * @memberof strategy
 * @example
 * new TunePoint(
 *      150, 129,
 *      [151, 129, 'table_1'],
 *      [148, 128, 'table_2']
 * );
 */
class TunedPoint {
    /**
     * Add multiple Points, add Points for each table. It must has
     * at least one Point which will be used as default. Other Points
     * must have tag!
     *
     * @param {Number} defaultX Default point X coordinate
     * @param {Number} defaultY Default point Y coordinate
     */
    constructor(defaultX, defaultY) {
        let table = Mep.Config.get('table');

        // If there are table dependent points
        for (let i = 2; i < arguments.length; i++) {
            // Check if the argument is valid
            if (typeof arguments[i][0] === 'undefined' ||
                typeof arguments[i][1] === 'undefined' ||
                typeof arguments[i][2] === 'undefined') {

                Mep.Log.error(TAG, 'Invalid arguments');
                continue;
            }

            // Check for similar table
            let baseTableInput = arguments[i][2].split('_')[0];
            let baseTableConfig = table.split('_')[0];
            if (baseTableInput === baseTableConfig) {
                this.point = new Point(arguments[i][0], arguments[i][1]);
            }

            // Check if table name matches
            if (table == arguments[i][2]) {
                this.point = new Point(arguments[i][0], arguments[i][1]);
                break;
            }
        }

        // Otherwise use default point
        if (typeof this.point === 'undefined') {
            this.point = new Point(defaultX, defaultY);
        }
    }

    /**
     * Get point depending on the chosen table in configuration.
     *
     * @returns {Point} Point
     */
    getPoint() {
        return this.point;
    }
}

module.exports = TunedPoint;
