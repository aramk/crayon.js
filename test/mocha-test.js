var chai = require('chai'),
  expect = chai.expect;
chai.Assertion.includeStack = true;

describe('Array', function() {
  it('should be true', function() {
    expect('123').to.equal('123');
  })
});
