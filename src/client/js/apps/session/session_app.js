define(function(require) {
  'use strict';

  var PF = require('js/app/obj');
  var logger = PF.logger.get('root/js/apps/session/session_app');

  PF.module('SessionApp', function(SessionApp, PF, Backbone, Marionette, $, _) {
    SessionApp.Router = Marionette.AppRouter.extend({
      appRoutes: {
        'session': 'show_session_info'
      }
    });

    var API = {
      show_session_info: function() {
        var controller = require('js/apps/session/show/controller');
        controller.show_session_info();
        PF.execute('headerapp:set_active_navitem', 'session');
      },
    };

    PF.on('session:show', function() {
      logger.trace('PF.event - session:show -- enter');
      PF.navigate('session');
      API.show_session_info();
      logger.trace('PF.event - session:show -- exit');
    });

    PF.addInitializer(function(){
      (function() {
        return new SessionApp.Router({
          controller: API
        });
      }());
    });
  });

  return PF.SessionApp;
});
