/**
 * General configuration file
 */

var Config = {
    /**
     * Enable console output.
     * IMPORTANT: Writing to console can be slow therefor it is suggested to turn this off in release.
     */
    DEBUG: true,

    // Enable web simulation.
    // Communication with the robot will redirected to web simulation interface.
    SIMULATION: true,

    // TODO
    DEBUG_TO_FILE: false,
}

module.exports = Config;