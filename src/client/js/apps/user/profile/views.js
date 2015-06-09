define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  //var logger = AppObj.logger.get('root/js/apps/user/profile/views');

  AppObj.module('UserApp.Profile.Views', function(Views, AppObj, Backbone, Marionette, $, _) {
    require('js/common/views');

    Views.UserProfile = AppObj.Common.Views.AppObjItemView.extend({
      __name: 'UserProfile',
      template: _.template(require('text!js/apps/user/profile/templates/profile.html'), { variable: 'data' }),

      triggers: {
        'click a.js-logout': 'logout-clicked',
        'click a.js-email': 'email-connect-clicked',
        'click a.js-facebook': 'facebook-connect-clicked',
        'click a.js-google': 'google-connect-clicked',
        'click a.js-twitter': 'twitter-connect-clicked'
      }
    });
  });

  return AppObj.UserApp.Profile.Views;
});
