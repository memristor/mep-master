const TAG = 'MotionTarget';

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