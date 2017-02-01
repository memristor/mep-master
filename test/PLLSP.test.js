const sinon = require('sinon');
const PLLSP = Mep.require('misc/protocols/PLLSP');
const Buffer = require('buffer').Buffer;
const assert = require('assert');

describe('PLLSP', () => {
    let spy = sinon.spy();
    let pllsp = new PLLSP({
        bufferSize: 150,
        onDataCallback: spy
    });

    describe('#push', () => {
        it('should fire only packet type', () => {
            // Generate single packet
            let buffer = Buffer.from(['P'.charCodeAt(0)]);
            let packet = pllsp.generate(buffer);

            // Spy on event
            pllsp.push(packet);

            assert(spy.args[0][0].compare(Buffer.from(['P'.charCodeAt(0)])) === 0);
        });

        it('should concatenate two data chunks', () => {
            let buffer = Buffer.from([
                'G'.charCodeAt(0),
                100 >> 8,
                100 & 0xff,
                0 >> 8,
                0 & 0xff,
                0,
                1
            ]);
            let packet = pllsp.generate(buffer);

            // Spy on event
            pllsp.push(packet.slice(0, 5));
            pllsp.push(packet.slice(5, packet.length));

            assert(buffer.compare(spy.args[1][0]) === 0);
        });

        it('should concatenate two data chunks with junk', () => {
            let buffer = Buffer.from([
                'G'.charCodeAt(0),
                100 >> 8,
                100 & 0xff,
                0 >> 8,
                0 & 0xff,
                0,
                1
            ]);
            let packet = pllsp.generate(buffer);

            // Spy on event
            pllsp.push(packet.slice(Buffer.from('ju'))); // Junk
            pllsp.push(packet.slice(0, 5));
            pllsp.push(packet.slice(5, packet.length));
            pllsp.push(packet.slice(Buffer.from('nk'))); // Junk

            assert(buffer.compare(spy.args[2][0]) === 0);
        });

        it('should separate two packets from single data chunk', () => {
            let singleBuffer = Buffer.from([
                'G'.charCodeAt(0),
                100 >> 8,
                100 & 0xff,
                0 >> 8,
                0 & 0xff,
                0,
                1
            ]);
            let twoPackets = Buffer.concat([
                pllsp.generate(singleBuffer),
                pllsp.generate(singleBuffer)
            ]);

            // Spy on event
            pllsp.push(twoPackets);

            assert(singleBuffer.compare(spy.args[3][0]) === 0);
            assert(singleBuffer.compare(spy.args[4][0]) === 0);
        });

        it('should find multiple packets inside chunk with junk', () => {
            let singleBuffer = Buffer.from([
                'G'.charCodeAt(0),
                100 >> 8,
                100 & 0xff,
                0 >> 8,
                0 & 0xff,
                0,
                1
            ]);
            let multiplePackets = Buffer.concat([
                pllsp.generate(singleBuffer),
                Buffer.from('ju'),
                pllsp.generate(singleBuffer),
                Buffer.from('n'),
                pllsp.generate(singleBuffer),
                Buffer.from('k'),
            ]);

            // Spy on event
            pllsp.push(multiplePackets);

            assert(singleBuffer.compare(spy.args[5][0]) === 0);
            assert(singleBuffer.compare(spy.args[6][0]) === 0);
            assert(singleBuffer.compare(spy.args[7][0]) === 0);
        });
    });
});