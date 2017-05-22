const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');

/**
 * Simplified functions for mep command prompt. All methods are accessible by using `t.` prefix.
 */
class Console {
    /**
     * Go to (x, y) position.
     * @example mep > t.go(100, 200, { pf: true })
     * @param {Number} x
     * @param {Number} y
     * @param {Object} config
     * @returns {Promise}
     */
    async go(x, y, config) {
        await Mep.Motion.go(new TunedPoint(x, y), config);
    }

    /**
     * Rotate to angle
     * @example mep > t.rotate(90)
     * @param angle
     * @param config
     * @returns {Promise}
     */
    async rotate(angle, config) {
        await Mep.Motion.rotate(new TunedAngle(angle), config);
    }

    /**
     * Go forward
     * @example mep > t.forward(100)
     * @param millimeters
     * @returns {Promise}
     */
    async forward(millimeters) {
        await Mep.Motion.straight(millimeters);
    }

    /**
     * Return robot to home
     * @example mep > t.home(100)
     * @returns {Promise.<void>}
     */
    async home() {
        let homePosition = new TunedPoint(...Mep.Config.get('Drivers:MotionDriver:startPosition'));
        await Mep.Motion.go(homePosition, { pf: true, tolerance: -1, speed: 100, backward: true });
    }

    /**
     * Motion driver test, drive robot in rectangle.
     * @returns {Promise.<void>}
     */
    async test() {
        Mep.getDriver('MotionDriver').reset();
        Mep.getDriver('MotionDriver').setRefreshInterval(50);
        Mep.getDriver('MotionDriver').setSpeed(70);

        for (let i = 0; i < 0; i++) {
            await Mep.getDriver('MotionDriver').moveToPosition(new Point(0, -500));
            await Mep.getDriver('MotionDriver').moveToPosition(new Point(-1000, -500));
            await Mep.getDriver('MotionDriver').moveToPosition(new Point(-1000, 0));
            await Mep.getDriver('MotionDriver').moveToPosition(new Point(0, 0));
        }
    }

    /**
     * List all available drivers for current current configuration
     * @example mep > t.drivers()
     */
    drivers() {
        console.log('List of available drivers');
        for (let id in Mep.Config.get('Drivers')) {
            console.log(id);
        }
    }

    /**
     * List driver properties for driver with id
     * @param {String} id
     * @example mep > t.driver('MotionDriver')
     */
    driver(id) {
        if (Mep.Config.get('Drivers:' + id) === true) {
            console.log('Listing driver properties for driver:', id);
            console.log(Mep.Config.get('Drivers:' + id));
        } else {
            console.log('There is no drivers with id', id);
        }
    }

    testMethod(angle = 100){
      SmallRobot.setPosition(angle);
    }
}

module.exports = Console;
