define(function(require) {
  'use strict';

  var PF = require('js/app/obj');
  var logger = PF.logger.get('root/js/apps/user/access/views');

  PF.module('UserApp.Access.Views', function(Views, PF, Backbone, Marionette, $, _) {
    require('js/common/views');

    /** @type {Object} View for a single form supporting account login or creation (user selected) */
    Views.AccessForm = PF.Common.Views.PFItemView.extend({
      __name: 'AccessForm',
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
      },

      modelEvents: {
        'change': 'render'
      },

      ui: {
        'password_input': 'input#user-access-password'
      },

      // Class methods
      initialize: function() {
        this.current_has_pw_flag = true; // label text clicks gen 2 events so if-gate DOM changes based on them
      },

      show_validation_errors: function(validation_errors) {
        var $view = this.$el;
        /** Remove all error messages added to form */
        var clear_form_errors = function(){
          var $form = $view.find('form');
          $form.find('.js-validation-message').each(function(){
            $(this).remove();
          });
          $form.find('.form-group.has-error').each(function(){
            $(this).removeClass('has-error');
          });
        };
        /** Add error message `value` to form for field `key` */
        var mark_error = function(value, key){
          var $form_group = $view.find('#user-access-' + key).parent();
          var $errorEl = $('<span>', {class: 'js-validation-message help-block', text: value});
          $form_group.append($errorEl).addClass('has-error');
        };
        clear_form_errors();
        _.each(validation_errors, mark_error);
      },

      // Event handlers
      submit_clicked: function(event) {
        require('backbone_syphon');
        event.preventDefault();
        var data = Backbone.Syphon.serialize(this);
        this.model.set(data, { silent: true });
        logger.debug('local-access submitted with: ' + JSON.stringify(data));
        this.trigger('local-access-submitted', data);
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
    Views.SignupForm = PF.Common.Views.PFItemView.extend({
      __name: 'SignupForm',
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

      show_validation_errors: function(validation_errors) {
        var $view = this.$el;
        /** Remove all error messages added to form */
        var clear_form_errors = function(){
          var $form = $view.find('form');
          $form.find('.js-validation-message').each(function(){
            $(this).remove();
          });
          $form.find('.form-group.has-error').each(function(){
            $(this).removeClass('has-error');
          });
        };
        /** Add error message `value` to form for field `key` */
        var mark_error = function(value, key){
          var $form_group = $view.find('#user-signup-' + key).parent();
          var $errorEl = $('<span>', {class: 'js-validation-message help-block', text: value});
          $form_group.append($errorEl).addClass('has-error');
        };
        clear_form_errors();
        _.each(validation_errors, mark_error);
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

  return PF.UserApp.Access.Views;
});
