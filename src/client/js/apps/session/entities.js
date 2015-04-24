define(function(require) {
  'use strict';

  var q = require('q');
  var PF = require('js/app/obj');
  var logger = PF.logger.get('root/js/apps/session/entities');

  PF.module('SessionApp.Entities', function(Entities, PF, Backbone, Marionette, $, _) {
    require('js/common/base_entities');

    Entities.SessionInfo = PF.Entities.PFDatabaseModel.extend({
      __name: 'SessionInfo',
      urlRoot: '/api/session/session'
    });

    var API = {
      get_session_info_promise: function() {
        logger.trace('API.get_session_info_promise -- enter');
        var deferred = q.defer();
        var session_info = new Entities.SessionInfo();
        session_info.fetch({
          success: function(model) { deferred.resolve(model); },
          error: function() { deferred.resolve(undefined); }
        });
        return deferred.promise;
      }
    };

    PF.reqres.setHandler('sessionapp:entities:info', function() {
      return API.get_session_info_promise();
    });
  });
});
