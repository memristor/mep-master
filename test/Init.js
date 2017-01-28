process.env.MEP_TEST = true;
global.Mep = require('../src/Mep');
const sinon = require('sinon');

let spy = sinon.spy();
Mep.init(spy);
