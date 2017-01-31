const CircularBuffer = require('../src/utils/CircularBuffer');
const Buffer = require('buffer').Buffer;
const assert = require('assert');

describe('CircularBuffer', () => {
    let circularBuffer = new CircularBuffer(25);

    describe('#topFront', () => {
        it('should return same buffer as added', () => {
            let buffer = Buffer.allocUnsafe(10);
            circularBuffer.push(buffer);

            assert(circularBuffer.topFront(10).compare(buffer) === 0);
        });

        it('should return same buffer after overload', () => {
            let buffer = Buffer.allocUnsafe(10);
            circularBuffer.push(buffer);

            assert(circularBuffer.topFront(10).compare(buffer) === 0);
        });
    });
});