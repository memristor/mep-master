'use strict';
/** @namespace services.motion */

const TAG = 'MotionTarget';

/**
 * Target (point & params) that robot has to reach
 * @memberOf services.motion
 */
class MotionTarget {
    constructor(point, params) {
        this.point = point;
        this.params = params;
    }

    getPoint() {
        return this.point;
    }

    getParams() {
        return this.params;
    }
}

module.exports = MotionTarget;