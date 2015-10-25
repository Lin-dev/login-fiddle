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

  it('app/api/helpers - expected methods found', function() {
    var name = 'app/api/helpers';
    var module = require(name);
    num_funcs[name] = 0;
    module.inject_pr_into_router_impl.should.be.a.function;
    num_funcs[name]++;
  });

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

  it('app/api/user/router_impl - expected methods found', function() {
    var name = 'app/api/user/router_impl';
    var module = require(name);
    num_funcs[name] = 0;
    module.get_user.should.be.a.function;
    num_funcs[name]++;
    module.logout.should.be.a.function;
    num_funcs[name]++;
    module.deactivate.should.be.a.function;
    num_funcs[name]++;
    module.change_password.should.be.a.function;
    num_funcs[name]++;
    module.local_check_login.should.be.a.function;
    num_funcs[name]++;
    module.local_check_reactivate.should.be.a.function;
    num_funcs[name]++;
    module.local_check_signup.should.be.a.function;
    num_funcs[name]++;
    module.local_check_connect.should.be.a.function;
    num_funcs[name]++;
    module.access_local_login.should.be.a.function;
    num_funcs[name]++;
    module.access_local_reactivate.should.be.a.function;
    num_funcs[name]++;
    module.access_local_signup.should.be.a.function;
    num_funcs[name]++;
    module.connect_local_connect.should.be.a.function;
    num_funcs[name]++;
    module.connect_local_disconnect.should.be.a.function;
    num_funcs[name]++;
    module.access_fb_auth.should.be.a.function;
    num_funcs[name]++;
    module.access_fb_callback.should.be.a.function;
    num_funcs[name]++;
    module.access_google_auth.should.be.a.function;
    num_funcs[name]++;
    module.access_google_callback.should.be.a.function;
    num_funcs[name]++;
    module.access_twitter_auth.should.be.a.function;
    num_funcs[name]++;
    module.access_twitter_callback.should.be.a.function;
    num_funcs[name]++;
    module.reactivate_fb_auth.should.be.a.function;
    num_funcs[name]++;
    module.reactivate_fb_callback.should.be.a.function;
    num_funcs[name]++;
    module.reactivate_google_auth.should.be.a.function;
    num_funcs[name]++;
    module.reactivate_google_callback.should.be.a.function;
    num_funcs[name]++;
    module.reactivate_twitter_auth.should.be.a.function;
    num_funcs[name]++;
    module.reactivate_twitter_callback.should.be.a.function;
    num_funcs[name]++;
    module.connect_google_auth.should.be.a.function;
    num_funcs[name]++;
    module.connect_google_callback.should.be.a.function;
    num_funcs[name]++;
    module.connect_google_disconnect.should.be.a.function;
    num_funcs[name]++;
    module.connect_fb_auth.should.be.a.function;
    num_funcs[name]++;
    module.connect_fb_callback.should.be.a.function;
    num_funcs[name]++;
    module.connect_fb_disconnect.should.be.a.function;
    num_funcs[name]++;
    module.connect_twitter_auth.should.be.a.function;
    num_funcs[name]++;
    module.connect_twitter_callback.should.be.a.function;
    num_funcs[name]++;
    module.connect_twitter_disconnect.should.be.a.function;
    num_funcs[name]++;
  });

  it('app/api/util/router_impl - expected methods found', function() {
    var name = 'app/api/util/router_impl';
    var module = require(name);
    num_funcs[name] = 0;
    module.success.should.be.a.function;
    num_funcs[name]++;
    module.failure.should.be.a.function;
    num_funcs[name]++;
    module.flash_message.should.be.a.function;
    num_funcs[name]++;
    module.version_info.should.be.a.function;
    num_funcs[name]++;
    module.redirect_to.should.be.a.function;
    num_funcs[name]++;
    module.redirect_to_profile.should.be.a.function;
    num_funcs[name]++;
  });

  // This test must be last in its suite
  test_lib.create_test_to_check_exports('tests check for all expected exported methods',
    './src/server/app/api/', 'method exports', num_funcs, test_lib.num_func_in_module);
});
