'use strict';

describe('js/app/config', function() {
  beforeEach(function(done) {
    var that = this;
    require(['js/app/config'], function(config) {
      that.config = config;
      done();
    });
  });

  describe('app', function() {
    it('app.logged_in_cookie_name should be logged_in', function() {
      expect(this.config.app.logged_in_cookie_name).toEqual('logged_in');
    });
  });

  describe('apps/user', function() {
    it('apps.user.local_password_max_length should be 256', function() {
      expect(this.config.apps.user.local_password_max_length).toEqual(256);
    });
    it('apps.user.facebook_response_type should be code', function() {
      expect(this.config.apps.user.facebook_response_type).toEqual('code');
    });
    it('apps.user.facebok_redirect_uri should be https://localhost:27974/api/access/facebook/callback', function() {
      expect(this.config.apps.user.facebook_redirect_uri)
        .toEqual('https://localhost:27974/api/access/facebook/callback');
    });
    it('apps.user.facebook_scope should be [public_profile, email]', function() {
      expect(this.config.apps.user.facebook_scope.indexOf('public_profile')).not.toEqual(-1);
      expect(this.config.apps.user.facebook_scope.indexOf('email')).not.toEqual(-1);
      expect(this.config.apps.user.facebook_scope.length).toEqual(2);
    });
  });
});
