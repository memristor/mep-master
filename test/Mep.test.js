const assert = require('assert');

describe('Mep', () => {
    describe('#require', () => {
        it('should throw an error if it is root directory', () => {
            assert.throws(Mep.require.bind(Mep, 'Mep'), /not allowed/);
        });

        it('should throw an error if directory is not allowed', () => {
            assert.throws(Mep.require.bind(Mep, 'config/Config'), /not allowed/);
        });

        it('should not throw an error if library is valid', () => {
            assert.doesNotThrow(Mep.require.bind(Mep, 'misc/Point'), /not allowed/);
        });
    });

    describe('Config', () => {
        describe('#get', () => {
            it('should have Drivers.MotionDriver property', () => {
                assert(Mep.Config.get('Drivers').MotionDriver !== undefined)
            });
        });
    });
});