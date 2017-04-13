'use strict';

/** @namespace drivers.lunarcollector */

const TAG = 'LunarCollector';


/**
 * @param {String} config.leftTrack Name of Dynamixel driver which runs left track
 * @param {String} config.rightTrack Name of Dynamixel driver which runs right track
 * @param {String} config.leftHand Name of Dynamixel driver which runs left hand
 * @param {String} config.rightHand Name of Dynamixel driver which runs right hand
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
        this._limiter = Mep.getDriver(this.config['@dependencies']['limiter']);
        this._servoPump = Mep.getDriver(this.config['@dependencies']['servoPump']);


        this._leftHand.setSpeed(600);
        this._rightHand.setSpeed(600);
        this._servoPump.setPosition(100); // Put put inside robot
    }

    collect() {
        this._leftTrack.setSpeed(1023, true);
        this._rightTrack.setSpeed(1023);
        this.startTrack();
        let leftHandPromise = this._leftHand.go(500, { tolerance: 150 });
        let rightHandPromise = this._rightHand.go(510, { tolerance: 150 });

        return Promise.all([
            leftHandPromise,
            rightHandPromise
        ]);
    }

    startTrack() {
        this._bigTrack.start(100);
    }

    stopTrack() {
        this._bigTrack.stop();
    }

    async openLimiter() {
        await this.stopTrack();
        await this._limiter.go(330);
        await this.startTrack();
    }

    closeLimiter() {
        return this._limiter.go(500);
    }

    hold() {
        this._leftTrack.setSpeed(0);
        this._rightTrack.setSpeed(0);
    }

    prepare() {
        this._leftTrack.setSpeed(0);
        this._rightTrack.setSpeed(0);
        let leftHandPromise = this._leftHand.go(600);
        let rightHandPromise = this._rightHand.go(400);
        this.startTrack();

        return Promise.all([
            leftHandPromise,
            rightHandPromise
        ]);
    }

    standby() {
        this._leftTrack.setSpeed(0);
        this._rightTrack.setSpeed(0);
        this.stopTrack();
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