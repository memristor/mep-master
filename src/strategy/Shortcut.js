"use strict";

/** @namespace strategy */

const TunedPoint = Mep.require('strategy/TunedPoint');
const TunedAngle = Mep.require('strategy/TunedAngle');

/**
 * Populates global space with short functions and variables in order to provide
 * easier and faster way to write strategies.
 * NOTE: Polluting a global space generally is not a good way to go, however after
 * a year of experience in this case it is a good solution.
 *
 * @example Shortcut.make();
 * @memberOf strategy
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class Shortcut {
    static make() {
        global.Scheduler = Mep.require('strategy/Scheduler');
        global.Task = Mep.require('strategy/Task');

        global.delay = Mep.require('misc/Delay');

        global.go = (x, y, config) => {
            return Mep.Motion.go(new TunedPoint(x, y), config)
        };

        global.rotate = (angle, config) => {
            return Mep.Motion.rotate(new TunedAngle(angle), config);
        };

        global.straight = (millimeters) => {
            return Mep.Motion.straight(millimeters);
        };

        global.home = () => {
            let homePosition = new TunedPoint(...Mep.Config.get('Drivers:MotionDriver:startPosition'));
            return Mep.Motion.go(homePosition, {pf: true, tolerance: -1, speed: 100, backward: true});
        };

        global.test = async () => {
            Mep.getDriver('MotionDriver').reset();
            Mep.getDriver('MotionDriver').setRefreshInterval(50);
            Mep.getDriver('MotionDriver').setSpeed(70);

            for (let i = 0; i < 0; i++) {
                await Mep.getDriver('MotionDriver').moveToPosition(new Point(0, -500));
                await Mep.getDriver('MotionDriver').moveToPosition(new Point(-1000, -500));
                await Mep.getDriver('MotionDriver').moveToPosition(new Point(-1000, 0));
                await Mep.getDriver('MotionDriver').moveToPosition(new Point(0, 0));
            }
        };

        global.drivers = async () => {
            console.log('List of available drivers');
            for (let id in Mep.Config.get('Drivers')) {
                console.log(id);
            }
        };

        global.driver = async(id) => {
            if (Mep.Config.get('Drivers:' + id) === true) {
                console.log('Listing driver properties for driver:', id);
                console.log(Mep.Config.get('Drivers:' + id));
            } else {
                console.log('There is no drivers with id', id);
            }
        }
    }
}


module.exports = Shortcut;
