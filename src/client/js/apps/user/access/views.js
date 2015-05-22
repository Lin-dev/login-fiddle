define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/user/access/views');

  AppObj.module('UserApp.Access.Views', function(Views, AppObj, Backbone, Marionette, $, _) {
    require('js/common/views');

    /** @type {Object} View for a single form supporting account login or creation (user selected) */
    Views.AccessForm = AppObj.Common.Views.AppObjFormItemView.extend({
      __name: 'AccessForm',
      __form_element_id_prefix: 'user-access-',
      template: _.template(require('text!js/apps/user/access/templates/access.html'), { variable: 'data' }),

      triggers: {
        'click a.js-home': 'home-clicked',
        'click .js-has-password': {
          // caught as a trigger so that the event which catches it can access `this` (view). The intent is that this
          // event is only responded to by the view instance (via it's `onHasPasswordFlagClicked` method)
          // intent is that this is only referenced inside the view class
          event: 'hasPasswordFlagClicked',
          preventDefault: false,
          stopPropogation: false
        }
      },

      events: {
        'click button.js-submit': 'submit_clicked',
        'click button.js-facebook': 'facebook_clicked'
      },

      modelEvents: {
        'change': 'render'
      },

      ui: {
        'password_input': 'input#user-access-local-password'
      },

      // Class methods
      initialize: function() {
        this.current_has_pw_flag = true; // label text clicks gen 2 events so if-gate DOM changes based on them
        AppObj.Common.Views.AppObjFormItemView.prototype.initialize.call(this);
      },

      // Event handlers
      submit_clicked: function(event) {
        require('backbone_syphon');
        event.preventDefault();
        var data = Backbone.Syphon.serialize(this);
        this.model.set(data, { silent: true });
        logger.debug('submit_clicked with: ' + JSON.stringify(data));
        this.trigger('local-access-submitted', data);
      },

      facebook_clicked: function(event) {
        event.preventDefault();
        logger.debug('facebook_clicked');
        this.trigger('facebook-access-clicked');
      },

      /**
       * Responds to hasPasswordFlagClicked events triggered on this view, setting the `user-access-password` input's
       * disabled status to true if the "No, help me sign in" option is checked.
       *
       * NB: `this` still refers to the DOM element, so we can pass it to Backbone,syphon (whew!)
       *
       * @param  {Object} vmc An object with this `view`, its `model` and its `collection` (`undefined`)
       */
      onHasPasswordFlagClicked: function(vmc) {
        require('backbone_syphon');
        var data = Backbone.Syphon.serialize(this);
        var new_has_pw_flag = $.parseJSON(data.has_pw_flag);
        // label text clicks gen 2 events so if-gate DOM changes based on them:
        if(new_has_pw_flag !== vmc.view.current_has_pw_flag) {
          vmc.view.current_has_pw_flag = new_has_pw_flag;
          vmc.view.ui.password_input.prop('disabled', !vmc.view.current_has_pw_flag);
        }
      }
    });

    /** @type {Object} View for inputting info needed for local account creation */
    Views.SignupForm = AppObj.Common.Views.AppObjFormItemView.extend({
      __name: 'SignupForm',
      __form_element_id_prefix: 'user-signup-',
      template: _.template(require('text!js/apps/user/access/templates/signup.html'), { variable: 'data' }),

      triggers: {
        'click a.js-home': 'home-clicked',
        'click a.js-login': 'login-clicked', // LISTEN TO THIS IN CONTROLLER, trigger user:login
      },

      events: {
        'click button.js-submit': 'submit_clicked',
      },

      modelEvents: {
        'change': 'render'
      },

      // Event handlers
      submit_clicked: function(event) {
        require('backbone_syphon');
        event.preventDefault();
        var data = Backbone.Syphon.serialize(this);
        this.model.set(data, { silent: true });
        logger.debug('Local signup submitted with: ' + JSON.stringify(data));
        this.trigger('local-signup-submitted', data);
      },
    });
  });

  return AppObj.UserApp.Access.Views;
});
