var chai = require('chai'),
  expect = chai.expect;
chai.Assertion.includeStack = true;

var $ = require('jquery');
GLOBAL.jQuery = $;

var Crayon = require('../../src/core/Crayon.js');

describe('Crayon', function() {
  it('should defined', function() {
    expect(Crayon).to.exist;
  })
});
