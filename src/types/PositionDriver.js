const BaseDriver = require('./BaseDriver');

class PositionDriver extends BaseDriver {
    constructor() {
        super();

        if (typeof this.getPosition !== 'function') {
            throw new TypeError("Must override getPosition()");
        }

        this.groups.push('position');
    }
}

module.exports = PositionDriver;
