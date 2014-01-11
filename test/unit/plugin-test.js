var chai = require('chai'),
  expect = chai.expect;
chai.Assertion.includeStack = true;

var $ = require('jquery');
GLOBAL.jQuery = $;

var plugin = require('../../src/plugin.js');

describe('plugin', function() {
  it('should be true', function() {
    expect('123').to.equal('123');
  })
});
