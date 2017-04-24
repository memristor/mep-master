'use strict';

const Delay = Mep.require('misc/Delay');

/** @namespace drivers.lunarcollector */

const TAG = 'LunarCollector';
//
//
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
            ejectorSpeed: 150,
            colorTimeout: 5000
        }, config);
        this.name = name;

        this._leftTrack = Mep.getDriver(this.config['@dependencies']['leftTrack']);
        this._rightTrack = Mep.getDriver(this.config['@dependencies']['rightTrack']);
        this._leftHand = Mep.getDriver(this.config['@dependencies']['leftHand']);
        this._rightHand = Mep.getDriver(this.config['@dependencies']['rightHand']);
        this._bigTrack = Mep.getDriver(this.config['@dependencies']['bigTrack']);
        this._limiter = Mep.getDriver(this.config['@dependencies']['limiter']);
        this._servoPump = Mep.getDriver(this.config['@dependencies']['servoPump']);
        this._vacuumPump = Mep.getDriver(this.config['@dependencies']['vacuumPump']);
        this._cylinder = Mep.getDriver(this.config['@dependencies']['cylinder']);
        this._circularEjector = Mep.getDriver(this.config['@dependencies']['circularEjector']);
        this._colorSensor = Mep.getDriver(this.config['@dependencies']['colorSensor']);
        this._colorRotator = Mep.getDriver(this.config['@dependencies']['colorRotator']);
        this._colorServo = Mep.getDriver(this.config['@dependencies']['colorServo']);

        this._middleDetector = Mep.getDriver(this.config['@dependencies']['middleDetector']);
        this._frontDetector = Mep.getDriver(this.config['@dependencies']['frontDetector']);
        this._backDetector = Mep.getDriver(this.config['@dependencies']['backDetector']);

        this._leftHand.setSpeed(600);
        this._rightHand.setSpeed(600);
        this._servoPump.setPosition(200); // Put put inside robot
    }

    isEmpty() {
        return (this._middleDetector.getLastValue() === 0 &&
            this._frontDetector.getLastValue() === 0 &&
            this._backDetector.getLastValue() === 0
        );
    }
    isLastHere() {
        return (this._backDetector.getLastValue() === 1);
    }
    collect() {
        this._leftTrack.setSpeed(1023, true);
        this._rightTrack.setSpeed(1023);
        this.startTrack();
        let leftHandPromise = this._leftHand.go(500, { tolerance: 150 });
        let rightHandPromise = this._rightHand.go(515, { tolerance: 150 });

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
        this._circularEjector.stop();
    }

    async ejectSide() {
        this._limiter.setPosition(530);

        this._cylinder.write(0);
        this._vacuumPump.write(1);
        try { await this._servoPump.go(200); } catch (e) {}
        this._cylinder.write(1);
        await Delay(1000);
        this._cylinder.write(0);
        await Delay(1000);

        // Eject hand
        this._vacuumPump.write(0);
        try { await this._servoPump.go(850); } catch (e) {}
        this._cylinder.write(1);
        await Delay(700);
        this._cylinder.write(0);
    }

    async colorStandby() {
        await Delay(100);
        this._colorServo.setPosition(600);
        this._colorRotator.write(255);
        this._colorSensor.stop();
    }

    rotate() {
        let lunarCollector = this;
        let requiredColor = (Mep.Config.get('table').indexOf('blue') >= 0) ? 'blue' : 'yellow';
        this._colorSensor.start();
        this._colorRotator.write(100);
        this._colorServo.setPosition(730);

        return new Promise((resolve, reject) => {
            let colorSensor = this._colorSensor;

            let colorChangedPromise = (color) => {
                if (color === requiredColor) {
                    colorSensor.removeListener('changed', colorChangedPromise);
                    resolve();
                    lunarCollector.colorStandby();
                }
            };

            this._colorSensor.on('changed', colorChangedPromise);

            setTimeout(() => {
                reject();
                lunarCollector.colorStandby();
                colorSensor.removeListener('changed', colorChangedPromise);
            }, this.config.colorTimeout);
        });
    }


    async openLimiter() {
        await this.stopTrack();
        await this._limiter.go(310);
        await this.startTrack();
        this._circularEjector.start(this.config.ejectorSpeed);
    }

    closeLimiter() {
        this._circularEjector.stop();
        return this._limiter.go(480);
    }

    hold() {
        this._leftTrack.setSpeed(0);
        this._rightTrack.setSpeed(0);
    }

    async prepare() {
        this._leftTrack.setSpeed(0);
        this._rightTrack.setSpeed(0);

        try {
            await Promise.all([
                this._leftHand.go(550),
                this._rightHand.go(450)
            ]);
        } catch (e) {
            Mep.Log.error(TAG, 'prepare', e);
        }

        this.startTrack();
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
