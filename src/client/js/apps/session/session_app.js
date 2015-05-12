define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/session/session_app');

  AppObj.module('SessionApp', function(SessionApp, AppObj, Backbone, Marionette, $, _) {
    SessionApp.Router = Marionette.AppRouter.extend({
      appRoutes: {
        'session': 'show_session_info'
      }
    });

    var API = {
      show_session_info: function() {
        var controller = require('js/apps/session/show/controller');
        controller.show_session_info();
        AppObj.execute('headerapp:set_active_navitem', 'session');
      },
    };

    AppObj.on('session:show', function() {
      logger.trace('AppObj.event - session:show -- enter');
      AppObj.navigate('session');
      API.show_session_info();
      logger.trace('AppObj.event - session:show -- exit');
    });

    AppObj.addInitializer(function(){
      (function() {
        return new SessionApp.Router({
          controller: API
        });
      }());
    });
  });

  return AppObj.SessionApp;
});
