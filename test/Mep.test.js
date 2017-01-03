const should = require('should');

describe('Mep', function () {
    describe('#require', function () {
        it('should throw an error if it is root directory', function () {
            Mep.require.bind(null, 'Log').should.throw('Directory is not allowed');
        });

        it('should throw an error if directory is not allowed', function () {
            Mep.require.bind(null, 'config/Config').should.throw('Directory is not allowed');
        });

        it('should not throw an error if library is valid', function () {
            Mep.require.bind(null, 'types/Point').should.not.throw();
        });
    });

    describe('Config', function () {
        describe('#get', function () {
            it('should have Drivers.MotionDriver property', function () {
                Mep.Config.get('Drivers').should.have.property('MotionDriver');
            });
        });
    });
});