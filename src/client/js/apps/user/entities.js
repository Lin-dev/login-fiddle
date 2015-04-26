define(function(require) {
  'use strict';

  var q = require('q');
  var PF = require('js/app/obj');
  var logger = PF.logger.get('root/js/apps/user/entities');

  PF.module('UserApp.Entities', function(Entities, PF, Backbone, Marionette, $, _) {
    require('js/common/base_entities');

    Entities.User = PF.Entities.PFDatabaseModel.extend({
      __name: 'User',
      urlRoot: '/api/user/user'
    });

    var API = {
      get_promise: function(user_id) {
        logger.trace('API.get_promise -- enter');
        var deferred = q.defer();
        var user = new Entities.User({ id: user_id });
        user.fetch({
          success: function(user_model) { deferred.resolve(user_model); },
          error: function() { deferred.resolve(undefined); }
        });
        return deferred.promise;
      }
    };

    PF.reqres.setHandler('userapp:entities:user', function() {
      return API.get_promise();
    });
  });
});
