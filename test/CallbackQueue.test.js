const CallbackQueue = Mep.require('misc/CallbackQueue');
const assert = require('assert');

describe('CallbackQueue', () => {
    let cq = new CallbackQueue();
    let ret, ret2;

    cq.add(function (a, b) {
        ret = a + b
    });
    cq.add(function (a, b) {
        ret2 = a + b
    });

    describe('#notifyAll(2, 3)', () => {
        cq.notifyAll([2, 3]);

        it('should return set `ret` value to `5`', () => {
            assert(ret === 5);
        });

        it('should return set `ret2` value to `5`', () => {
            assert(ret2 === 5);
        });
    });
});