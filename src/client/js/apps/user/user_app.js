define(function(require) {
  'use strict';

  var PF = require('js/app/obj');
  //var logger = PF.logger.get('root/js/apps/user/user_app');

  PF.module('UserApp', function(UserApp, PF, Backbone, Marionette, $, _) {
    UserApp.Router = Marionette.AppRouter.extend({
      appRoutes: {
        'login': 'show_login_form',
        'profile': 'show_profile',
        'signup': 'show_signup_form'
      }
    });

    var API = {
      show_login_form: function() {
        var controller = require('js/apps/user/login/controller');
        controller.show_login_form();
        PF.execute('headerapp:set_active_navitem', 'user');
      },

      show_profile: function() {
        var controller = require('js/apps/user/profile/controller');
        controller.show_profile();
        PF.execute('headerapp:set_active_navitem', 'user');
      },

      show_signup_form: function() {
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
      API.show_profile();
    });

    PF.on('user:signup', function() {
      PF.navigate('signup');
      API.show_signup_form();
    });

    PF.addInitializer(function(){
      (function() {
        return new UserApp.Router({
          controller: API
        });
      }());
    });
  });

  return PF.UserApp;
});
