define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/user/user_app');

  AppObj.module('UserApp', function(UserApp, AppObj, Backbone, Marionette, $, _) {
    UserApp.Router = Marionette.AppRouter.extend({
      appRoutes: {
        'access': 'show_access_form',
        'access/signup': 'show_signup_form',
        'access/reactivate': 'show_reactivate_form',
        'profile': 'show_user_profile',
        'profile/logout': 'proc_logout',
        'profile/deactivate': 'proc_deactivate',
        'profile/change/password': 'proc_change_password',
        'profile/connect/local': 'proc_conn_local',
        'profile/connect/facebook': 'proc_conn_fb',
        'profile/connect/google': 'proc_conn_google',
        'profile/connect/twitter': 'proc_conn_twitter',
        'profile/disconnect/local': 'proc_disc_local',
        'profile/disconnect/facebook': 'proc_disc_fb',
        'profile/disconnect/google': 'proc_disc_google',
        'profile/disconnect/twitter': 'proc_disc_twitter'
      }
    });

    var API = {
      show_access_form: function show_access_form(trigger_after_login) {
        logger.trace('API.show_access_form -- enter');
        var controller = require('js/apps/user/access/controller');
        controller.show_access_form(trigger_after_login);
        AppObj.execute('headerapp:set_active_navitem', 'user');
      },

      show_signup_form: function show_signup_form(trigger_after_signup, email_address) {
        logger.trace('API.show_signup_form -- enter');
        var controller = require('js/apps/user/access/controller');
        controller.show_signup_form(trigger_after_signup, email_address);
        AppObj.execute('headerapp:set_active_navitem', 'user');
      },

      /**
       * Displays the reactivation form, filled out with the deactivated user's email address if they just tried to
       * log in using their local email
       * @param {String} local_email The local email address of the account to reactivate (optional)
       */
      show_reactivate_form: function show_reactivate_form(local_email) {
        logger.debug('API.show_reactivate_form -- enter');
        var controller = require('js/apps/user/access/controller');
        controller.show_reactivate_form(local_email);
        AppObj.execute('headerapp:set_active_navitem', 'user');
      },

      show_user_profile: function show_user_profile(query_string) {
        logger.trace('API.show_user_profile -- enter');
        var controller = require('js/apps/user/profile/controller');
        controller.show_user_profile(query_string);
        AppObj.execute('headerapp:set_active_navitem', 'user');
      },

      proc_logout: function proc_logout() {
        logger.trace('API.proc_logout -- enter');
        var controller = require('js/apps/user/profile/controller');
        controller.proc_logout();
        AppObj.execute('headerapp:set_active_navitem', 'user');
      },

      proc_deactivate: function proc_deactivate() {
        logger.trace('API.proc_deactivate -- enter');
        var controller = require('js/apps/user/profile/controller');
        controller.proc_deactivate();
        AppObj.execute('headerapp:set_active_navitem', 'user');
      },

      proc_change_password: function proc_change_password() {
        logger.trace('API.proc_change_password -- enter');
        var controller = require('js/apps/user/profile/controller');
        controller.proc_change_password();
        AppObj.execute('headerapp:set_active_navitem', 'user');
      },

      proc_conn_local: function proc_conn_local() {
        logger.trace('API.proc_conn_local -- enter');
        var controller = require('js/apps/user/profile/controller');
        controller.proc_conn_local();
        AppObj.execute('headerapp:set_active_navitem', 'user');
      },

      proc_conn_fb: function proc_conn_fb() {
        logger.trace('API.proc_conn_fb -- enter');
        var controller = require('js/apps/user/profile/controller');
        controller.proc_conn_fb();
        AppObj.execute('headerapp:set_active_navitem', 'user');
      },

      proc_conn_google: function proc_conn_google() {
        logger.trace('API.proc_conn_google -- enter');
        var controller = require('js/apps/user/profile/controller');
        controller.proc_conn_google();
        AppObj.execute('headerapp:set_active_navitem', 'user');
      },

      proc_conn_twitter: function proc_conn_twitter() {
        logger.trace('API.proc_conn_twitter -- enter');
        var controller = require('js/apps/user/profile/controller');
        controller.proc_conn_twitter();
        AppObj.execute('headerapp:set_active_navitem', 'user');
      },

      proc_disc_local: function proc_disc_local() {
        logger.trace('API.proc_disc_local -- enter');
        var controller = require('js/apps/user/profile/controller');
        controller.proc_disc_local();
        AppObj.execute('headerapp:set_active_navitem', 'user');
      },

      proc_disc_fb: function proc_disc_fb() {
        logger.trace('API.proc_disc_fb -- enter');
        var controller = require('js/apps/user/profile/controller');
        controller.proc_disc_fb();
        AppObj.execute('headerapp:set_active_navitem', 'user');
      },

      proc_disc_google: function proc_disc_google() {
        logger.trace('API.proc_disc_google -- enter');
        var controller = require('js/apps/user/profile/controller');
        controller.proc_disc_google();
        AppObj.execute('headerapp:set_active_navitem', 'user');
      },

      proc_disc_twitter: function proc_disc_twitter() {
        logger.trace('API.proc_disc_twitter -- enter');
        var controller = require('js/apps/user/profile/controller');
        controller.proc_disc_twitter();
        AppObj.execute('headerapp:set_active_navitem', 'user');
      }
    };

    AppObj.on('user:access', function(trigger_after_login) {
      AppObj.navigate('access');
      API.show_access_form(trigger_after_login);
    });

    AppObj.on('user:access:signup', function(trigger_after_signup, email_address) {
      AppObj.navigate('access/signup');
      API.show_signup_form(trigger_after_signup, email_address);
    });

    AppObj.on('user:access:reactivate', function(optional_local_email) {
      AppObj.navigate('access/reactivate');
      API.show_reactivate_form(optional_local_email);
    });

    AppObj.on('user:profile', function() {
      AppObj.navigate('profile');
      API.show_user_profile(undefined);
    });

    AppObj.on('user:profile:logout', function() {
      AppObj.navigate('profile/logout');
      API.proc_logout();
    });

    AppObj.on('user:profile:change:password', function() {
      AppObj.navigate('profile/change/password');
      API.proc_change_password();
    });

    AppObj.on('user:profile:deactivate', function() {
      AppObj.navigate('profile/deactivate');
      API.proc_deactivate();
    });

    AppObj.on('user:profile:connect:local', function() {
      AppObj.navigate('profile/connect/local');
      API.proc_conn_local();
    });

    AppObj.on('user:profile:connect:fb', function() {
      AppObj.navigate('profile/connect/facebook');
      API.proc_conn_fb();
    });

    AppObj.on('user:profile:connect:google', function() {
      AppObj.navigate('profile/connect/google');
      API.proc_conn_google();
    });

    AppObj.on('user:profile:connect:twitter', function() {
      AppObj.navigate('profile/connect/twitter');
      API.proc_conn_twitter();
    });

    AppObj.on('user:profile:disconnect:local', function() {
      AppObj.navigate('profile/disconnect/local');
      API.proc_disc_local();
    });

    AppObj.on('user:profile:disconnect:fb', function() {
      AppObj.navigate('profile/disconnect/facebook');
      API.proc_disc_fb();
    });

    AppObj.on('user:profile:disconnect:google', function() {
      AppObj.navigate('profile/disconnect/google');
      API.proc_disc_google();
    });

    AppObj.on('user:profile:disconnect:twitter', function() {
      AppObj.navigate('profile/disconnect/twitter');
      API.proc_disc_twitter();
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
