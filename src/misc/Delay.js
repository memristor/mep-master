'use strict';

/** @namespace misc */

/**
 * Synced setTimeout()
 * @memberOf misc
 * @example
 * const Delay = Mep.require('misc/Delay');
 * async foo() {
 *  await Delay(200); // Wait 200ms
 * }
 * @param {Number} milliseconds Milliseconds to sleep
 * @returns {Promise} Promise that given number of milliseconds passed
 */
async function delay(milliseconds) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, milliseconds);
    });
}

module.exports = delay;