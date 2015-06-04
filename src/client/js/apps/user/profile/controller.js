define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/user/profile/controller');

  AppObj.module('UserApp.Profile', function(Profile, AppObj, Backbone, Marionette, $, _) {
    Profile.controller = {
      show_user_profile: function show_user_profile() {
        if(AppObj.is_logged_in()) {
          var up_promise = AppObj.request('userapp:entities:userprofile');
          up_promise.then(function(up) {
            logger.debug('AppObj.UserApp.Profile.contoller.show_user_profile -- showing: ' + JSON.stringify(up));
            var Views = require('js/apps/user/profile/views');
            var view = new Views.UserProfile({ model: up });
            view.on('logout-clicked', function() {
              logger.debug('Logging out');
              $.get('/api/user/logout', function(resp_data, textStatus, jqXhr) {
                AppObj.trigger('home:show');
              });
            });
            AppObj.region_main.show(view);
          });
        }
        else {
          AppObj.trigger('user:access', 'user:profile');
        }
      }
    };
  });

  return AppObj.UserApp.Profile.controller;
});
