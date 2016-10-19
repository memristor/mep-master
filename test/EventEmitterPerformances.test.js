const EventEmitter = require('events');

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

describe('EventEmitterPerformances', function() {
    var testObject = new TestClass();

    for (let i = 0; i < N; i++) {
        testObject.on('default', function () { });
    }

    it('should calculate publish time for ' + N + ' subscriptions', function() {
        testObject.publish().should.equal(true);
    });
});