// Allow statements that are not assignments or function calls (e.g. should statements)
/* jshint -W030 */

'use strict';

require('should');

var test_lib = require('test/lib');

describe('app/api - exported methods', function() {
  /**
   * Map of module name to the number of functions that module exports
   * @type {Object}
   */
  var num_funcs = {};

  it('app/api/entry/router_impl - expected methods found', function() {
    var name = 'app/api/entry/router_impl';
    var module = require(name);
    num_funcs[name] = 0;
    module.get_entries.should.be.a.function;
    num_funcs[name]++;
    module.get_tags.should.be.a.function;
    num_funcs[name]++;
  });

  it('app/api/session/router_impl - expected methods found', function() {
    var name = 'app/api/session/router_impl';
    var module = require(name);
    num_funcs[name] = 0;
    module.get_session.should.be.a.function;
    num_funcs[name]++;
  });

  // This test must be last in its suite
  test_lib.create_test_to_check_exports('tests check for all expected exported methods',
    './src/server/app/api/', 'method exports', num_funcs, test_lib.num_func_in_module);
});
