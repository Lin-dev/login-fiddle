define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/user/user_app');

  AppObj.module('UserApp', function(UserApp, AppObj, Backbone, Marionette, $, _) {
    UserApp.Router = Marionette.AppRouter.extend({
      appRoutes: {
        'access': 'show_access_form',
        'profile': 'show_user_profile'
      }
    });

    var API = {
      show_access_form: function show_access_form(trigger_after_login) {
        logger.trace('API.show_access_form -- enter');
        var controller = require('js/apps/user/access/controller');
        controller.show_access_form(trigger_after_login);
        AppObj.execute('headerapp:set_active_navitem', 'user');
      },

      show_user_profile: function show_user_profile(query_string) {
        logger.trace('API.show_user_profile -- enter');
        var controller = require('js/apps/user/profile/controller');
        controller.show_user_profile(query_string);
        AppObj.execute('headerapp:set_active_navitem', 'user');
      }
    };

    AppObj.on('user:access', function(trigger_after_login) {
      AppObj.navigate('access');
      API.show_access_form(trigger_after_login);
    });

    AppObj.on('user:profile', function() {
      AppObj.navigate('profile');
      API.show_user_profile(undefined);
    });

    AppObj.addInitializer(function(){
      logger.trace('AppObj.addInitializer -- enter');
      (function() {
        return new UserApp.Router({
          controller: API
        });
      }());
      logger.trace('AppObj.addInitializer -- enter');
    });
  });

  return AppObj.UserApp;
});
