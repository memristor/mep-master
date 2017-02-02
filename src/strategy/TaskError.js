'use strict';
/** @namespace strategy */

/**
 * Describes an error during strategy execution (eg. robot stuck)
 * @memberOf strategy
 */
class TaskError {
    /**
     * Default constructor for class
     * @param source - Name of module which thrown an error
     * @param action - Unique identifier for task error
     * @param message - Describes more about task error
     * @param params - Additional parameters to describe an error
     */
    constructor(source, action, message = '', params = {}) {
        this.action = action;
        this.source = source;
        this.message = message;
        this.params = params;
    }
}

module.exports = TaskError;