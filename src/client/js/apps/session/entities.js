define(function(require) {
  'use strict';

  var q = require('q');
  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/session/entities');

  AppObj.module('SessionApp.Entities', function(Entities, AppObj, Backbone, Marionette, $, _) {
    require('js/common/base_entities');

    Entities.SessionInfo = AppObj.Base.Entities.PersistentModel.extend({
      __name: 'SessionInfo',
      urlRoot: '/api/session/session'
    });

    var API = {
      get_session_info_promise: function get_session_info_promise() {
        logger.trace('API.get_session_info_promise -- enter');
        var deferred = q.defer();
        var session_info = new Entities.SessionInfo();
        session_info.fetch({
          success: function success(model) { deferred.resolve(model); },
          error: function error() { deferred.resolve(undefined); }
        });
        return deferred.promise;
      }
    };

    AppObj.reqres.setHandler('sessionapp:entities:info', function() {
      return API.get_session_info_promise();
    });
  });

  return AppObj.SessionApp.Entities;
});
