/** @namespace types */

const TAG = 'TunedAngle';

/**
 * Tunable angle. Angle is chosen depends on table name in configuration.
 *
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 * @memberof types
 * @example
 * new TunePoint(
 *      150, 129,
 *      [151, 129, 'table_1'],
 *      [148, 128, 'table_2']
 * );
 */
class TunedAngle {
    /**
     * Add multiple Points, add Points for each table. It must has
     * at least one Point which will be used as default. Other Points
     * must have tag!
     *
     * @param defaultX {integer} - Default point X coordinate
     */
    constructor(defaultAngle) {
        // If there are table dependent points
        for (let i = 1; i < arguments.length; i++) {

            // Check if the argument is valid
            if (typeof arguments[i][0] === 'undefined' ||
                typeof arguments[i][1] === 'undefined') {

                Mep.Log.warn(TAG, 'Invalid arguments');
                continue;
            }

            // Check if table name matches
            if (Mep.Config.get('table') == arguments[i][1]) {
                this.point = arguments[i][0];
            }
        }

        // Otherwise use default point
        if (typeof this.point === 'undefined') {
            this.angle = defaultAngle;
        }
    }

    /**
     * Get angle depending on the chosen table in configuration.
     *
     * @returns {number} - Point
     */
    getAngle() {
        return this.angle;
    }
}

module.exports = TunedAngle;
