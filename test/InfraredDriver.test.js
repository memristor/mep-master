const sinon = require('sinon');
const InfraredDriver = require('../src/drivers/infrared/InfraredDriver');
const Point = Mep.require('misc/geometry/Point');
const Buffer = require('buffer').Buffer;
const assert = require('assert');

const CAN = Mep.require('drivers/can/CanDriverSimulator');



describe('InfraredDriverTest', () => {
    let ican = new CAN('CANTest');
    let infraredDriver = new InfraredDriver('InfraredDriver', {
        sensorAngle: 60,
        infraredMaxDistance: 200,
        sensorX: -10,
        sensorY: 10,
        cid: 1,
        _communicator: ican
    });

    describe('#processDetection(true)', () => {
        let terrainSpy;
        beforeEach(() => {
            terrainSpy = sinon.spy();
            infraredDriver.on('obstacleDetected', terrainSpy);
            infraredDriver.processDetection(Buffer.from([0x01]));
        });

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