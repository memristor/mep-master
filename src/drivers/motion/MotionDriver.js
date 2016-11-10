const MotionDriverBinder = require('bindings')('motion').MotionDriverBinder;
const EventEmiter = require('events');
const Util = require('util');
const Point = Mep.require('types/Point');

Util.inherits(MotionDriverBinder, EventEmiter);

/**
 * Driver enables communication with Memristor's motion driver.
 *
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class MotionDriver extends MotionDriverBinder {
    constructor(name, config) {
        super(
            true,
            config.startX,
            config.startY
        );

        this.name = name;
    }

    getPosition() {
        let position = super.getPosition();
        return (new Point(position[0], position[1]));
    }

    provides() {
        return ['position', 'control'];
    }
}

module.exports = MotionDriver;
