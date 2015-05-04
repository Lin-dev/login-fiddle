define(function(require) {
  'use strict';

  var PF = require('js/app/obj');
  //var logger = PF.logger.get('root/js/apps/user/profile/views');

  PF.module('UserApp.Profile.Views', function(Views, PF, Backbone, Marionette, $, _) {
    require('js/common/views');

    Views.UserProfile = PF.Common.Views.PFItemView.extend({
      __name: 'UserProfile',
      template: _.template(require('text!js/apps/user/profile/templates/profile.html'), { variable: 'data' }),

      triggers: {
        'click a.js-logout': 'logout-clicked',
      }
    });
  });

  return PF.UserApp.Profile.Views;
});
