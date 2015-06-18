// Purpose of this file is to fail a test if a value changes - checked values are also used in client and so
// should be updated there if updated here and vice versa, the tests are a prompt for this

// Allow statements that are not assignments or function calls (e.g. should statements)
/* jshint -W030 */

'use strict';

require('should');

var user_config = require('app/config/user');

describe('app/config', function() {
  describe('app/config/user', function() {
    // NB: don't check fb.auth_client_id or fb.auth_client_secret as those are set at install, not build
    it('fb.auth_callback_url should be /api/user/access/fb/callback', function() {
      user_config.fb.auth_callback_url.should.equal('/api/user/access/fb/callback');
    });
    it('google.auth_callback_url should be /api/user/access/google/callback', function() {
      user_config.google.auth_callback_url.should.equal('/api/user/access/google/callback');
    });
    it('local.auth_username_max_length should be 254', function() {
      user_config.local.username_max_length.should.equal(254);
    });
    it('local.auth_password_max_length should be 256', function() {
      user_config.local.password_max_length.should.equal(256);
    });
    it('local.auth_username_field should be local_email', function() {
      user_config.local.username_field.should.equal('local_email');
    });
    it('local.auth_password_field should be local_password', function() {
      user_config.local.password_field.should.equal('local_password');
    });
    it('twitter.auth_callback_url should be /api/user/access/twitter/callback', function() {
      user_config.twitter.auth_callback_url.should.equal('/api/user/access/twitter/callback');
    });
    it('logged_in_cookie_name should be logged_in', function() {
      user_config.logged_in_cookie_name.should.equal('logged_in');
    });
  });
});
