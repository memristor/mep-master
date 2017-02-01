const sinon = require('sinon');
const InfraredDriver = require('../src/drivers/infrared/InfraredDriver');
const Point = Mep.require('misc/Point');
const Buffer = require('buffer').Buffer;
const assert = require('assert');

describe('InfraredDriverTest', () => {
    let infraredDriver = new InfraredDriver('InfraredDriver', {
        sensorAngle: 60,
        infraredMaxDistance: 200,
        sensorX: -10,
        sensorY: 10,
        deviceId: 0,
        '@dependencies': { communicator: 'CanDriver' }
    });

    describe('#processDetection(true)', () => {
        let terrainSpy = sinon.spy();
        infraredDriver.on('obstacleDetected', terrainSpy);

        infraredDriver.processDetection(Buffer.from([0x01]));

        it('should callback with params(163, 110)', () => {
            let point = terrainSpy.args[0][1];
            assert(Math.round(point.getX()) === 163);
            assert(Math.round(point.getY()) === 110);
        });
    });

    describe('Out Of Order', () => {
        it('should put driver out of order & throw an exception', () => {
            /*
            (new LaserDriver).bind(null, 'LaserDriverOutOfOrderTest', {
                laserAngle: 400,
                laserMaxDistance: 200,
                laserX: -10,
                laserY: 10,
                slaveAddress: 0,
                functionAddress: 0
            }).should.throw('`laserMaxDistance` is not defined');
            */
        });
    });
});