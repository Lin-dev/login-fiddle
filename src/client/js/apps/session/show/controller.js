define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/session/show/controller');

  AppObj.module('SessionApp.Show', function(Show, AppObj, Backbone, Marionette, $, _) {
    Show.controller = {
      show_session_info: function() {
        logger.trace('show_session_info -- enter');
        require('js/apps/session/entities');
        var Views = require('js/apps/session/show/views');
        var session_promise = AppObj.request('sessionapp:entities:info');
        session_promise.then(function(session_info) {
          logger.debug('show_session_info -- received: ' + JSON.stringify(session_info));
          var session_info_view = new Views.SessionInfoView({ model: session_info });
          AppObj.region_main.show(session_info_view);
          logger.debug('show_session_info -- show complete');
        });
      }
    };
  });

  return AppObj.SessionApp.Show.controller;
});
