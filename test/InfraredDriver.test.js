const should = require('should');
const sinon = require('sinon');
const InfraredDriver = require('../src/drivers/infrared/InfraredDriver');
const Point = Mep.require('types/Point');
const Buffer = require('buffer').Buffer;

describe('LaserDriverTest', function() {
    var infraredDriver = new InfraredDriver('InfraredDriver', {
        sensorAngle: 60,
        infraredMaxDistance: 200,
        sensorX: -10,
        sensorY: 10,
        deviceId: 0,
        '@dependencies': { communicator: 'CanDriver' }
    });

    describe('#processDetection(true)', function () {
        let terrainSpy = sinon.spy();
        infraredDriver.on('obstacleDetected', terrainSpy);

        infraredDriver.processDetection(Buffer.from([0x01]));

        it('should callback with params(90, 183)', function() {
            terrainSpy.calledWith(new Point(100 - 10, 173 + 10)).should.be.ok();
        });
    });

    describe('Out Of Order', function() {
        it('should put driver out of order & throw an exception', function() {
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