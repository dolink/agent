var chai = require('chai');
chai.Assertion.includeStack = true;

process.env.NODE_ENV = 'test';

exports.t = chai.assert;