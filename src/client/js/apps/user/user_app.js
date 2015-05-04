define(function(require) {
  'use strict';

  var PF = require('js/app/obj');
  var logger = PF.logger.get('root/js/apps/user/user_app');

  PF.module('UserApp', function(UserApp, PF, Backbone, Marionette, $, _) {
    UserApp.Router = Marionette.AppRouter.extend({
      appRoutes: {
        'login': 'show_login_form',
        'profile': 'show_user_profile',
        'signup': 'show_signup_form'
      }
    });

    var API = {
      show_login_form: function() {
        /*var controller = require('js/apps/user/login/controller');
        controller.show_login_form();
        PF.execute('headerapp:set_active_navitem', 'user');*/
      },

      show_user_profile: function() {
        logger.trace('API.show_user_profile -- enter');
        var controller = require('js/apps/user/profile/controller');
        controller.show_user_profile();
        PF.execute('headerapp:set_active_navitem', 'user');
      },

      show_signup_form: function() {
        logger.trace('API.show_signup_form -- enter');
        var controller = require('js/apps/user/signup/controller');
        controller.show_signup_form();
        PF.execute('headerapp:set_active_navitem', 'user');
      }
    };

    PF.on('user:login', function() {
      PF.navigage('login');
      API.show_login_form();
    });

    PF.on('user:profile', function() {
      PF.navigate('user');
      API.show_user_profile();
    });

    PF.on('user:signup', function() {
      PF.navigate('signup');
      API.show_signup_form();
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
