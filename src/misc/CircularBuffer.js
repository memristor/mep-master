'use strict';

/** @namespace misc */

/**
 * Implementation of circular buffer using Node.js's Buffer
 * @todo
 * @memberOf misc
 */
class CircularBuffer {
    constructor(size) {
        this._buffer = Buffer.allocUnsafe(size);
        this._start = 0;
        this._end = 0;
    }

    _circularSum(firstNumber, secondNumber, size) {
        if (firstNumber + secondNumber < size) {
            return firstNumber + secondNumber;
        } else {
            return (secondNumber + firstNumber - size);
        }
    }

    _circularCopy(target, source, targetStart, sourceStart, sourceEnd) {
        // We are trying to work with `.copy()` to speed up copying.
        // `.copy()` is implemented in C++
        if (targetStart === undefined) targetStart = 0;
        if (sourceStart === undefined) sourceStart = 0;
        if (sourceEnd === undefined) sourceEnd = source.length;

        if (target.length - targetStart > sourceEnd - sourceStart) {
            source.copy(
                target,
                targetStart,
                sourceStart,
                sourceEnd
            );

        } else {
            source.copy(
                target,
                targetStart,
                0,
                target.length - targetStart
            );
            source.copy(
                target,
                this._circularSum(targetStart, target.length - targetStart + 1, this._buffer.length),
                target.length - targetStart + 1
            );
        }
    }

    push(buffer) {
        this._circularCopy(this._buffer, buffer, this._end);
        this._end = this._circularSum(this._end, buffer.length, this._buffer.length);
    }

    getSize() {
        if (this._end > this._start) {
            return (this._end - this._start);
        }
        return (this._buffer.length - (this._start - this._end));
    }

    popFront(size) {

    }

    popBack(size) {

    }

    topFront(size) {
        let buffer = Buffer.allocUnsafe(size);
        this._circularCopy(buffer, this._buffer, 0, this._end - size, this._end);
        return buffer;
    }


    topBack(size) {

    }
}

module.exports = CircularBuffer;