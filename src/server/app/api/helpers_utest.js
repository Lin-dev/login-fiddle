// Allow statements that are not assignments or function calls (e.g. should statements)
/* jshint -W030 */

'use strict';

require('should');

var helpers = require('app/api/helpers');

var stub_function = function() {};
var stub_pr = {};

describe('app/api/helpers', function() {
  describe('module.exports.inject_pr_into_router_impl', function() {
    it('returns a function', function() {
      helpers.inject_pr_into_router_impl(stub_function, stub_pr).should.be.a.function;
    });
  });
});
