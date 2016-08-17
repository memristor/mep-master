const should = require('should');
const mepRequire = require('../core/MepRequire');

describe('MepRequire', function() {
    it('should throw if it is root directory', function() {
        mepRequire.bind(null, 'sadasd').should.throw('Library can\'t be in root');
    });

    it('should throw if directory is not allowed', function() {
        mepRequire.bind(null, 'config/Config').should.throw('Directory is not allowed');
    });

    it('should not throw an error if library is valid', function() {
        mepRequire.bind(null, 'types/Point').should.not.throw();
    });
});