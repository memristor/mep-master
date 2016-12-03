const BaseDriver = require('./BaseDriver');

class TerrainDriver extends BaseDriver {
    constructor() {
        super();

        this.groups.push('terrain');
    }
}

module.exports = TerrainDriver;