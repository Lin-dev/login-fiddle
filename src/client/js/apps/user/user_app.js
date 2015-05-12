define(function(require) {
  'use strict';

  var PF = require('js/app/obj');
  var logger = PF.logger.get('root/js/apps/user/user_app');

  PF.module('UserApp', function(UserApp, PF, Backbone, Marionette, $, _) {
    UserApp.Router = Marionette.AppRouter.extend({
      appRoutes: {
        'access': 'show_access_form',
        'profile': 'show_user_profile'
      }
    });

    var API = {
      show_access_form: function(trigger_after_login) {
        logger.trace('API.show_access_form -- enter');
        var controller = require('js/apps/user/access/controller');
        controller.show_access_form(trigger_after_login);
        PF.execute('headerapp:set_active_navitem', 'user');
      },

      show_user_profile: function() {
        logger.trace('API.show_user_profile -- enter');
        var controller = require('js/apps/user/profile/controller');
        controller.show_user_profile();
        PF.execute('headerapp:set_active_navitem', 'user');
      }
    };

    PF.on('user:access', function(trigger_after_login) {
      PF.navigate('access');
      API.show_access_form(trigger_after_login);
    });

    PF.on('user:profile', function() {
      PF.navigate('user');
      API.show_user_profile();
    });

    PF.addInitializer(function(){
      logger.trace('PF.addInitializer -- enter');
      (function() {
        return new UserApp.Router({
          controller: API
        });
      }());
      logger.trace('PF.addInitializer -- enter');
    });
  });

  return PF.UserApp;
});
