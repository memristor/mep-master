const should = require('should');
const sinon = require('sinon');
const LaserDriver = require('../src/drivers/laser/LaserDriver');

describe('LaserDriverTest', function() {
    var laserDriver = new LaserDriver('LaserDriver', {
        laserAngle: 60,
        laserMaxDistance: 200,
        laserX: -10,
        laserY: 10,
        slaveAddress: 0,
        functionAddress: 0
    });

    describe('#processDetection(true)', function () {
        let terrainSpy = sinon.spy();
        laserDriver.on('terrain', terrainSpy);

        laserDriver.processDetection(true);

        it('should callback with params(90, 183)', function() {
            terrainSpy.calledWith(100 - 10, 173 + 10).should.be.ok();
        });
    });



    // Test out of order mechanism
    var laserDriverOutOfOrder = new LaserDriver('LaserDriverOutOfOrderTest', {
        laserAngle: 400,
        laserMaxDistance: 200,
        laserX: -10,
        laserY: 10,
        slaveAddress: 0,
        functionAddress: 0
    });

    describe('Out Of Order', function() {
        it('should put driver out of order', function() {

        });
    });
});