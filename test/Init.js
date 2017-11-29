process.env.MEP_TEST = true;
global.Mep = require('../src/Mep');

before((done) => {
    Mep.init().then(done);
});

after(() => {
    process.exit();
});

require('./CircularBuffer.test');
require('./EventEmitterPerformances.test');
require('./InfraredDriver.test');
require('./PLLSP.test');
require('./Mep.test');
require('./Point.test');
require('./TerrainService.test');
require('./TunedPoint.test');



