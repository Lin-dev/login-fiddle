// Allow statements that are not assignments or function calls (e.g. should statements)
/* jshint -W030 */

'use strict';

require('should');

var test_lib = require('test/lib');

describe('app/util - exported methods', function() {
  /**
   * Map of module name to the number of functions that module exports
   * @type {Object}
   */
  var num_funcs = {};

  it('app/util/auth/index - expected methods found', function() {
    // Nested methods checked in exported properties tests
    var name = 'app/util/auth/index';
    //var module = require(name);
    num_funcs[name] = 0;
  });

  it('app/util/logger/index - expected methods found', function() {
    var name = 'app/util/logger/index';
    var module = require(name);
    num_funcs[name] = 0;
    module.get.should.be.a.function;
    num_funcs[name]++;
    module.get_log4js.should.be.a.function;
    num_funcs[name]++;
  });

  /** Sequelize object has .sq object field for Sequelize and a .pr object field for all the models - no funcs */
  it('app/util/pr/index - expected methods found', function() {
    var name = 'app/util/pr/index';
    num_funcs[name] = 0;
  });

  /** Sequelize model module export is a function, not an object with functions - rely on Sequelize tests - no funcs */
  it('app/util/pr/auth - expected methods found', function() {
    var name = 'app/util/pr/auth';
    num_funcs[name] = 0;
  });

  /** Sequelize model module export is a function, not an object with functions - rely on Sequelize tests - no funcs */
  it('app/util/pr/entry - expected methods found', function() {
    var name = 'app/util/pr/entry';
    num_funcs[name] = 0;
  });

  // This test must be last in its suite
  test_lib.create_test_to_check_exports('tests check for all expected exported methods',
    './src/server/app/util/', 'method exports', num_funcs, test_lib.num_func_in_module);
});




describe('app/util - exported properties', function() {
  /**
   * Map of module name to the number of non-functions that module exports
   * @type {Object}
   */
  var num_nonfuncs = {};

  it('app/util/auth/index - expected properties found', function() {
    var name = 'app/util/auth/index';
    var module = require(name);
    num_nonfuncs[name] = 0;
    module.passport.should.be.an.Object;
    num_nonfuncs[name]++;
    module.mw.should.be.an.Object;
    module.mw.ensure_auth.should.be.a.function;
    module.mw.ensure_unauth.should.be.a.function;
    module.mw.set_client_auth_status_cookie.should.be.a.function;
    module.mw.set_session_start_date.should.be.a.function;
    num_nonfuncs[name]++;
    module.mw_gen.should.be.an.Object;
    module.mw_gen.check_post_has_req_fields.should.be.a.function;
    num_nonfuncs[name]++;
  });

  it('app/util/logger/index - expected properties found', function() {
    var name = 'app/util/logger/index';
    num_nonfuncs[name] = 0;
  });

  /** Sequelize object has .sq object field for Sequelize and a .pr object field for all the models - no funcs */
  it('app/util/pr/index - expected properties found', function() {
    var name = 'app/util/pr/index';
    var module = require(name);
    num_nonfuncs[name] = 0;
    module.pr.should.be.an.Object;
    num_nonfuncs[name]++;
    module.sq.should.be.an.Object;
    num_nonfuncs[name]++;
  });

  /** Sequelize model module export is a function, not an object with functions - rely on Sequelize tests - no funcs */
  it('app/util/pr/auth - expected properties found', function() {
    var name = 'app/util/pr/auth';
    num_nonfuncs[name] = 0;
  });

  /** Sequelize model module export is a function, not an object with functions - rely on Sequelize tests - no funcs */
  it('app/util/pr/entry - expected properties found', function() {
    var name = 'app/util/pr/entry';
    num_nonfuncs[name] = 0;
  });

  // This test must be last in its suite
  test_lib.create_test_to_check_exports('tests check for all expected exported properties',
    './src/server/app/util/', 'non-method exports', num_nonfuncs, test_lib.num_nonfunc_in_module);
});
