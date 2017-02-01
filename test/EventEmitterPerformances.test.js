const EventEmitter = require('events');
const assert = require('assert');

const N = 50;

class TestClass extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(N);
    }

    publish() {
        this.emit('default');
        return true;
    }
}

describe('EventEmitterPerformances', () => {
    let testObject = new TestClass();

    for (let i = 0; i < N; i++) {
        testObject.on('default', () => { });
    }

    it('should calculate publish time for ' + N + ' subscriptions', () => {
        assert(testObject.publish() === true);
    });
});