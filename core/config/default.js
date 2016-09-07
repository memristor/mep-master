/**
 * General configuration file
 *
 * @param {Boolean} DEBUG - Enable console output. IMPORTANT: Writing to console can be slow therefor it is suggested to turn this off in release.
 * @param {Boolean} SIMULATION - Enable web simulation. Communication with the robot will redirected to web simulation interface.
 */
var Config = {
    DEBUG: true,
    SIMULATION: true,

    Drivers: {
        MotionDriver: {
            //class: 'drivers/motion/MotionDriver'
        }
    },
}

module.exports = Config;
