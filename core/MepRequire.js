const Log = require('./Log');
const TAG = 'MepRequire';

var allowedDirectories = ['types', 'utils'];

/**
 * Global function to require library relative to `core` directory
 * @example
 *
 *
 * @param {String} library - Path to library
 * @returns {*} - Required library
 */
function mepRequire(library) {
    // Check if root
    if (library.indexOf('/') < 0) {
        throw new Error('Library can\'t be in root');
    }

    // Check if dir is allowed
    var dir = library.split('/')[0];
    if (allowedDirectories.indexOf(dir) < 0) {
        throw new Error('Directory is not allowed');
    }

    // Require lib
    return require('./' + library);
}

module.exports = mepRequire;