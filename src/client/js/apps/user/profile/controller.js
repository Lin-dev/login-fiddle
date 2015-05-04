define(function(require) {
  'use strict';

  var PF = require('js/app/obj');
  var logger = PF.logger.get('root/js/apps/user/profile/controller');

  PF.module('UserApp.Profile', function(Profile, PF, Backbone, Marionette, $, _) {
    Profile.controller = {
      show_user_profile: function() {
        var up_promise = PF.request('userapp:entities:userprofile');
        up_promise.then(function(up) {
          logger.debug('PF.UserApp.Profile.contoller.show_user_profile -- showing: ' + JSON.stringify(up));
          var Views = require('js/apps/user/profile/views');
          var view = new Views.UserProfile({ model: up });
          view.on('logout-clicked', function() {
            logger.debug('Logging out');
            $.get('/api/user/logout', function(resp_data, textStatus, jqXhr) {
              PF.trigger('home:show');
            });
          });
          PF.region_main.show(view);
        });
      }
    };
  });

  return PF.UserApp.Profile.controller;
});
