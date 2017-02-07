const MotionTarget = require('./MotionTarget');
const Line = Mep.require('misc/Line');

const TAG = 'MotionTargetQueue';

class MotionTargetQueue {
    constructor() {
        this._targets = [];
    }

    getTargets() {
        return this._targets;
    }

    addPointsBack(points, params) {
        for (let point of points) {
            this.addPointBack(point, params)
        }
    }

    addPointBack(point, params) {
        this._targets.push(new MotionTarget(point, params));
    }

    getTargetFront() {
        if (this.isEmpty()) {
            return null;
        }
        return this._targets[0];
    }

    getTargetBack() {
        if (this.isEmpty()) {
            return null;
        }
        return this._targets[this._targets.length - 1];
    }

    /**
     * Make line between current position and target if path finding is enabled
     * @returns {misc.Line}
     */
    getPfLine() {
        let target = this.getPfTarget();
        if (target !== null) {
            return (new Line(
                Mep.Position.getPosition(),
                target.getPoint()
            ));
        }
        return null;
    }

    /**
     * Get final target of path finding algorithm if path finding is enabled
     * @returns {MotionTarget}
     */
    getPfTarget() {
        let target = this.getTargetBack();
        if (target !== null && target.getParams().pf === true) {
            return target;
        }
        return null;
    }

    addPointsFront(points, params) {
        for (let point of points) {
            this.addPointFront(point, params);
        }
    }

    addPointFront(point) {
        this._targets.unshift(point);
    }

    removeFront() {
        this._targets.splice(0, 1);
    }

    removeBack() {
        this._targets.splice(this._targets.length - 1, 1)
    }

    isEmpty() {
        return (this._targets.length === 0);
    }

    empty() {
        this._targets = [];
    }
}

module.exports = MotionTargetQueue;