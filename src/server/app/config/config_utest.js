// Purpose of this file is to fail a test if a value changes - checked values are also used in client and so
// should be updated there if updated here and vice versa, the tests are a prompt for this

// Allow statements that are not assignments or function calls (e.g. should statements)
/* jshint -W030 */

'use strict';

require('should');

var user_config = require('app/config/user');

describe('app/config', function() {
  describe('app/config/user', function() {
    // NB: don't check facebook_auth.client_id or facebook_auth.client_secret as those are set at install, not build
    it('facebook_auth.callback_url should be https://localhost:27974/api/access/facebook/callback', function() {
      user_config.facebook_auth.callback_url.should.equal('https://localhost:27974/api/access/facebook/callback');
    });
    it('local_auth.username_max_length should be 254', function() {
      user_config.local_auth.username_max_length.should.equal(254);
    });
    it('local_auth.password_max_length should be 256', function() {
      user_config.local_auth.password_max_length.should.equal(256);
    });
    it('local_auth.username_field should be local_email', function() {
      user_config.local_auth.username_field.should.equal('local_email');
    });
    it('local_auth.password_field should be local_password', function() {
      user_config.local_auth.password_field.should.equal('local_password');
    });
    it('logged_in_cookie_name should be logged_in', function() {
      user_config.logged_in_cookie_name.should.equal('logged_in');
    });
  });
});
