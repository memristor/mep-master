const should = require('should');
const CallbackQueue = require('../core/CallbackQueue');

describe('CallbackQueueTest', function() {
    var cq = new CallbackQueue();
    var ret, ret2;

    cq.add(function(a, b) { ret = a + b });
    cq.add(function(a, b) { ret2 = a + b });

    describe('#notifyAll(2, 3)', function() {
        cq.notifyAll([2, 3]);

        it('should return set `ret` value to `5`', function() {
            ret.should.equal(5);
        });

        it('should return set `ret2` value to `5`', function() {
            ret2.should.equal(5);
        });
    });
});