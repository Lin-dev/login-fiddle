define(function(require) {
  'use strict';

  var PF = require('js/app/obj');
  var logger = PF.logger.get('root/js/apps/user/signup/views');

  PF.module('UserApp.Signup.Views', function(Views, PF, Backbone, Marionette, $, _) {
    require('js/common/views');

    Views.SignupForm = PF.Common.Views.PFItemView.extend({
      __name: 'SignupForm',
      template: _.template(require('text!js/apps/user/signup/templates/signup.html'), { variable: 'data' }),

      triggers: {
        'click a.js-login': 'login-clicked',
        'click a.js-home': 'home-clicked'
      },

      events: {
        'click button.js-submit': 'submit_clicked'
      },

      submit_clicked: function(event) {
        require('backbone_syphon');
        event.preventDefault();
        var data = Backbone.Syphon.serialize(this);
        this.model.set(data, { silent: true });
        logger.debug('local-signup submitted with: ' + JSON.stringify(data));
        this.trigger('local-signup-submitted', data);
      }
    });
  });

  return PF.UserApp.Signup.Views;
});
