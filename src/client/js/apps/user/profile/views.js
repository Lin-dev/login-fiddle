define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  //var logger = AppObj.logger.get('root/js/apps/user/profile/views');

  AppObj.module('UserApp.Profile.Views', function(Views, AppObj, Backbone, Marionette, $, _) {
    require('js/common/views');

    /**
     * @type {Object} View for containing profile-display sub views
     */
    Views.UserProfileLayout = AppObj.Common.Views.AppObjLayout.extend({
      __name: 'UserProfileLayout',
      template: _.template(require('text!js/apps/user/profile/templates/profile.html'), { variable: 'data' }),
      regions: {
        region_header: 'div.js-profile-header',
        region_message: 'div.js-flash-message',
        region_profile_data: 'div.js-profile-data',
        region_profile_admin: 'div.js-profile-admin'
      }
    });

    /**
     * @type {Object} View for displaying user profile data
     */
    Views.UserProfileData = AppObj.Common.Views.AppObjItemView.extend({
      __name: 'UserProfileData',
      template: _.template(require('text!js/apps/user/profile/templates/profile_data.html'), { variable: 'data' })
    });

    /**
     * @type {Object} View for displaying user profile connect UI elements
     */
    Views.UserProfileAdmin = AppObj.Common.Views.AppObjItemView.extend({
      __name: 'UserProfileAdmin',
      template: _.template(require('text!js/apps/user/profile/templates/profile_admin.html'), { variable: 'data' }),

      triggers: {
        'click a.js-logout': 'logout-clicked',
        'click a.js-email-connect': 'email-connect-clicked',
        'click a.js-fb-connect': 'fb-connect-clicked',
        'click a.js-fb-disconnect': 'fb-disconnect-clicked',
        'click a.js-google-connect': 'google-connect-clicked',
        'click a.js-google-disconnect': 'google-disconnect-clicked',
        'click a.js-twitter-connect': 'twitter-connect-clicked',
        'click a.js-twitter-disconnect': 'twitter-disconnect-clicked'
      }
    });
  });

  return AppObj.UserApp.Profile.Views;
});
