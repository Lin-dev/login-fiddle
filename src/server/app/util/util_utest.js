// Allow statements that are not assignments or function calls (e.g. should statements)
/* jshint -W030 */

'use strict';

require('should');

describe('app/util/pr/auth - model tests', function() {
  describe('user', function() {
    it('user scopes are [all, activated, deactivated] and returned by get_scope_names', function() {
      var pr = require('app/util/pr/index');
      pr.pr.auth.user.get_scope_names.should.be.a.function;
      var scopes = pr.pr.auth.user.get_scope_names();
      scopes.length.should.equal(3);
      scopes.indexOf('all').should.not.equal(-1);
      scopes.indexOf('activated').should.not.equal(-1);
      scopes.indexOf('deactivated').should.not.equal(-1);
    });
  });
});
