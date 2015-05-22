// Allow statements that are not assignments or function calls (e.g. should statements)
/* jshint -W030 */

'use strict';

require('should');

var user_config = require('app/config/user');

// TODO - TEST IN HERE THAT user_config.facebook_auth.callback_url === '/access/facebook/callback'
// this is to protect against changes to the callback URL but the hard coded URL in router.js not being updated

describe('app/api/user/router', function() {
  describe('access', function() {
    it('has a faceback call URL of /access/facebook/callback', function() {
      user_config.facebook_auth.callback_url.should.equal('/access/facebook/callback',
        'The faceback_auth.callback_url is hard coded in app/api/user/router.js to /access/facebook/callback');
    });
  });
});
