const EventEmitter = require('events').EventEmitter;

class BaseDriver extends EventEmitter {
    constructor() {
        super();

        this.groups = [];
    }

    getGroups() {
        return this.groups;
    }
}

module.exports = BaseDriver;
