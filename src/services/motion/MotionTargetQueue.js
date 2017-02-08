'use strict';
/** @namespace services.motion */

const MotionTarget = require('./MotionTarget');
const Line = Mep.require('misc/Line');

const TAG = 'MotionTargetQueue';

/**
 * Queue of targets (points) that robot has to reach.
 * @memberOf services.motion
 */
class MotionTargetQueue {
    constructor(changedCallback) {
        this._targets = [];
        this._changedCallback = (changedCallback === undefined) ? (() => {}) : changedCallback;
    }

    /**
     * Get all targets
     * @returns {Array<services.motion.MotionTarget>} - List of all targets
     */
    getTargets() {
        return this._targets;
    }

    /**
     * Add points at the end of the queue
     * @param points {Array<misc.Point>} - Array of points
     * @param params {Object} - Params for each target
     */
    addPointsBack(points, params) {
        for (let point of points) {
            this.addPointBack(point, params)
        }
        this._changedCallback(this._targets);
    }

    /**
     * Add single point at the end of the queue
     * @param point {misc.Point} - Point
     * @param params {Object} - Params for target
     */
    addPointBack(point, params) {
        this._addPointBack(point, params);
        this._changedCallback(this._targets);
    }

    _addPointBack(point, params) {
        this._targets.push(new MotionTarget(point, params));
    }

    /**
     * Add points at the beginning of the queue
     * @param points {Array<misc.Point>} - Array of points
     * @param params {Object} - Params for each target
     */
    addPointsFront(points, params) {
        for (let point of points) {
            this.addPointFront(point, params);
        }
        this._changedCallback(this._targets);
    }

    /**
     * Add single point at the beginning of the queue
     * @param points {misc.Point} - Point
     * @param params {Object} - Params for target
     */
    addPointFront(point, params) {
        this._addPointFront(point, params);
        this._changedCallback(this._targets);
    }

    _addPointFront(point, params) {
        this._targets.unshift(new MotionTarget(point, params));
    }

    /**
     * Get target at the front of queue
     * @returns {services.motion.MotionTarget}
     */
    getTargetFront() {
        if (this.isEmpty()) {
            return null;
        }
        return this._targets[0];
    }

    /**
     * Get target at the end of the queue
     * @returns {services.motion.MotionTarget}
     */
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

    /**
     * Remove target from front of queue
     */
    removeFront() {
        this._targets.splice(0, 1);
    }

    /**
     * Remove target from back of queue
     */
    removeBack() {
        this._targets.splice(this._targets.length - 1, 1)
    }

    /**
     * Check if queue is empty
     */
    isEmpty() {
        return (this._targets.length === 0);
    }

    /**
     * Delete all items from queue
     */
    empty() {
        this._targets = [];
        this._changedCallback();
    }
}

module.exports = MotionTargetQueue;