// Allow statements that are not assignments or function calls (e.g. should statements)
/* jshint -W030 */

'use strict';

require('should');

var user_config = require('app/config/user');

describe('app/api/user/router', function() {
  describe('access', function() {
    it('has a facebook callback URL of /api/user/access/facebook/callback', function() {
      /\/api\/user\/access\/facebook\/callback$/.test(user_config.facebook_auth.callback_url).should.equal(
        true,
        'The faceback_auth.callback_url in app/api/user/router.js expects /api/user/access/facebook/callback'
      );
    });
  });
});
