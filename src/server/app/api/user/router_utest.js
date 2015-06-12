// Allow statements that are not assignments or function calls (e.g. should statements)
/* jshint -W030 */

'use strict';

require('should');

var user_config = require('app/config/user');

describe('app/api/user/router', function() {
  describe('access', function() {
    it('has a facebook auth_callback_url of /api/user/access/facebook/callback', function() {
      /\/api\/user\/access\/facebook\/callback$/.test(user_config.facebook.auth_callback_url).should.equal(
        true,
        'The faceback_auth.callback_url in app/api/user/router.js expects /api/user/access/facebook/callback'
      );
    });

    it('has a twitter auth_callback_url of /api/user/access/twitter/callback', function() {
      /\/api\/user\/access\/twitter\/callback$/.test(user_config.twitter.auth_callback_url).should.equal(
        true,
        'The twitter_auth.callback_url in app/api/user/router.js expects /api/user/access/twitter/callback'
      );
    });
  });
});
