'use strict';

/** @namespace drivers.lunarcollector */

const TAG = 'LunarCollector';


/**
 * @param config.leftTrack {String} - Name of Dynamixel driver which runs left track
 * @param config.rightTrack {String} - Name of Dynamixel driver which runs right track
 * @param config.leftHand {String} - Name of Dynamixel driver which runs left hand
 * @param config.rightHand {String} - Name of Dynamixel driver which runs right hand
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
        this._bigTrack = Mep.getDriver(this.config['@dependencies']['bigTrack']);

        this._leftHand.setSpeed(600);
        this._rightHand.setSpeed(600);
    }

    collect() {
        this._leftTrack.setSpeed(1023, true);
        this._rightTrack.setSpeed(1023);
        this._bigTrack.start(100);
        let leftHandPromise = this._leftHand.go(500, { tolerance: 20 });
        let rightHandPromise = this._rightHand.go(520, { tolerance: 20 });

        return Promise.all([
            leftHandPromise,
            rightHandPromise
        ]);
    }

    prepare() {
        this._leftTrack.setSpeed(0);
        this._rightTrack.setSpeed(0);
        let leftHandPromise = this._leftHand.go(600);
        let rightHandPromise = this._rightHand.go(400);
        this._bigTrack.start(100);

        return Promise.all([
            leftHandPromise,
            rightHandPromise
        ]);
    }

    standby() {
        this._leftTrack.setSpeed(0);
        this._rightTrack.setSpeed(0);
        this._bigTrack.stop();
        let leftHandPromise = this._leftHand.go(860);
        let rightHandPromise = this._rightHand.go(160);

        return Promise.all([
            leftHandPromise,
            rightHandPromise
        ]);
    }

    getGroups() {
        return [];
    }
}

module.exports = LunarCollectorDriver;