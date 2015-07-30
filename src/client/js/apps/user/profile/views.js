define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/user/profile/views');

  AppObj.module('UserApp.Profile.Views', function(Views, AppObj, Backbone, Marionette, $, _) {
    require('js/common/views');

    /**
     * @type {Object} View for containing profile-display sub views
     */
    Views.UserProfileLayout = AppObj.Base.Views.AppObjLayout.extend({
      __name: 'UserProfileLayout',
      template: _.template(require('text!js/apps/user/profile/templates/profile.html'), { variable: 'data' }),
      regions: {
        region_header: 'div.js-profile-header',
        region_message: 'div.js-flash-message',
        region_profile_main: 'div.js-profile-main',
        region_profile_control_panel: 'div.js-profile-control-panel'
      }
    });

    /**
     * @type {Object} View for displaying user profile data
     */
    Views.UserProfileData = AppObj.Base.Views.AppObjItemView.extend({
      __name: 'UserProfileData',
      template: _.template(require('text!js/apps/user/profile/templates/profile_data.html'), { variable: 'data' })
    });

    /**
     * @type {Object} View for displaying user profile connect UI elements
     */
    Views.UserProfileControlPanel = AppObj.Base.Views.AppObjItemView.extend({
      __name: 'UserProfileControlPanel',
      template: _.template(require('text!js/apps/user/profile/templates/profile_admin.html'), { variable: 'data' }),

      triggers: {
        'click a.js-logout': 'logout-clicked',
        'click a.js-deactivate': 'deactivate-clicked',
        'click a.js-local-connect': 'local-connect-clicked',
        'click a.js-local-disconnect': 'local-disc-clicked',
        'click a.js-fb-connect': 'fb-connect-clicked',
        'click a.js-fb-disconnect': 'fb-disc-clicked',
        'click a.js-google-connect': 'google-connect-clicked',
        'click a.js-google-disconnect': 'google-disc-clicked',
        'click a.js-twitter-connect': 'twitter-connect-clicked',
        'click a.js-twitter-disconnect': 'twitter-disc-clicked'
      }
    });

    /**
     * @type {Object} View for displaying a form allowing a user to connect their email address and password
     */
    Views.LocalConnectForm = AppObj.Common.Views.AppObjFormItemView.extend({
      __name: 'LocalConnectForm',
      __form_element_id_prefix: 'local-connect-',
      template: _.template(require('text!js/apps/user/profile/templates/local_connect.html'), { variable: 'data' }),

      triggers: {
        'click a.js-profile': 'profile-clicked'
      },

      events: {
        'click button.js-submit': 'submit_clicked',
      },

      modelEvents: {
        'change': 'render'
      },

      // Event handlers
      submit_clicked: function submit_clicked(event) {
        require('backbone_syphon');
        event.preventDefault();
        var data = Backbone.Syphon.serialize(this);
        this.model.set(data, { silent: true });
        logger.debug('Local connect submitted with: ' + JSON.stringify(data));
        this.trigger('local-connect-submitted', data);
      }
    });
  });

  return AppObj.UserApp.Profile.Views;
});
