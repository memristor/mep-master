'use strict';
/** @namespace services.motion */

const TAG = 'MotionTarget';

/**
 * Target (point & params) that robot has to reach
 * @memberOf services.motion
 */
class MotionTarget {
    constructor(point, params) {
        this._point = point;
        this._params = params;
    }

    getPoint() {
        return this._point;
    }

    getParams() {
        return this._params;
    }
}

module.exports = MotionTarget;