'use strict';
/** @namespace strategy */

/**
 * Describes an error during strategy execution (eg. robot stuck)
 * @memberOf strategy
 */
class TaskError {
    /**
     * Default constructor for class
     * @param {String} source Name of module which thrown an error
     * @param {String} action Unique identifier for task error
     * @param {String} message Describes more about task error
     * @param {Object} params Additional parameters to describe an error
     */
    constructor(source, action, message = '', params = {}) {
        this.action = action;
        this.source = source;
        this.message = message;
        this.params = params;
    }
}

module.exports = TaskError;