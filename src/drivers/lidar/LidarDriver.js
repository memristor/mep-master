'use strict';

const TAG = 'LidarDriver';

class LidarDriver {
    constructor(name, config) {
        this.config = Object.assign({
            communicatorId: 1000
        }, config);
        this.name = name;
    }

    getPosition() {

    }

    getGroups() {
        return ['position', 'terrain'];
    }
}

module.exports = LidarDriver;