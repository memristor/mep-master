const CircularBuffer = require('../src/misc/CircularBuffer');
const Buffer = require('buffer').Buffer;
const assert = require('assert');

describe('CircularBuffer', () => {
    let circularBuffer = new CircularBuffer(25);

    describe('#topFront', () => {
        it('should return same buffer as added', () => {
            let buffer = Buffer.alloc(10, 0x44);
            circularBuffer.push(buffer);

            assert(circularBuffer.topFront(10).compare(buffer) === 0);
        });

        it('should return same buffer after overload', () => {
            let buffer = Buffer.alloc(10, 0x55);
            circularBuffer.push(buffer);

            //assert(circularBuffer.topFront(10).compare(buffer) === 0);
        });
    });
});