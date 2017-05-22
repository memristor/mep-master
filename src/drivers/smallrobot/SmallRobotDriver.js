'use strict';

const Delay = Mep.require('misc/Delay');

/** @namespace drivers.SmallRobot */

const TAG = 'SmallRobot';



class SmallRobotDriver {
    constructor(name, config) {
        this.config = Object.assign({
            ejectorSpeed: 150,
            colorTimeout: 5000
        }, config);
        this.name = name;

        this._ballPicker = Mep.getDriver(this.config['@dependencies']['BallPicker']);
        this._ballPicker.setPosition(200); 
    }



     setPosition(angle = 0) {
       this._ballPicker.setPosition(angle);
    }



}

module.exports = SmallRobotDriver;
