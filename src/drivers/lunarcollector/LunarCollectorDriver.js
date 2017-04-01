'use strict';

/** @namespace drivers.lunarcollector */

const TAG = 'LunarCollector';


/**
 * @param config.leftTrack {drivers.dynamixel.DynamixelDriver}
 * @param config.rightTrack {drivers.dynamixel.DynamixelDriver}
 * @param config.leftHand {drivers.dynamixel.DynamixelDriver}
 * @param config.rightHand {drivers.dynamixel.DynamixelDriver}
 * @memberOf drivers.lunarcollector
 * @author Darko Lukic <lukicdarkoo@gmail.com>
 */
class LunarCollectorDriver {
    constructor(name, config) {
        this.config = Object.assign({

        }, config);
        this.name = name;

        this._leftTrack = Mep.getDriver(this.config['@dependencies']['leftTrack']);
        this._rightTrack = Mep.getDriver(this.config['@dependencies']['rightTrack']);
        this._leftHand = Mep.getDriver(this.config['@dependencies']['leftHand']);
        this._rightHand = Mep.getDriver(this.config['@dependencies']['rightHand']);

        this._leftHand.setSpeed(300);
        this._rightHand.setSpeed(300);
    }

    collect() {
        this._leftTrack.setSpeed(1023, true);
        this._rightTrack.setSpeed(1023);
        let leftHandPromise = this._leftHand.go(500, { tolerance: 20 });
        let rightHandPromise = this._rightHand.go(520, { tolerance: 20 });

        //return new Promise((resolve, reject) => setTimeout(resolve, 100000));

        return Promise.all([
            leftHandPromise,
            rightHandPromise
        ]);
    }

    standby() {
        this._leftTrack.setSpeed(0);
        this._rightTrack.setSpeed(0);
        let leftHandPromise = this._leftHand.go(860);
        let rightHandPromise = this._rightHand.go(160);

        return Promise.all([
            leftHandPromise,
            rightHandPromise
        ]);
    }
    dump() {

    }
    getGroups() {
        return [];
    }
}

module.exports = LunarCollectorDriver;