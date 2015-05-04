define(function(require) {
  'use strict';

  var PF = require('js/app/obj');
  var logger = PF.logger.get('root/js/apps/user/access/views');

  PF.module('UserApp.Signup.Views', function(Views, PF, Backbone, Marionette, $, _) {
    require('js/common/views');

    Views.SignupForm = PF.Common.Views.PFItemView.extend({
      __name: 'SignupForm',
      template: _.template(require('text!js/apps/user/access/templates/access.html'), { variable: 'data' }),

      triggers: {
        'click a.js-login': 'login-clicked',
        'click a.js-home': 'home-clicked'
      },

      events: {
        'click button.js-submit': 'submit_clicked'
      },

      modelEvents: {
        'change': 'render'
      },

      submit_clicked: function(event) {
        require('backbone_syphon');
        event.preventDefault();
        var data = Backbone.Syphon.serialize(this);
        this.model.set(data, { silent: true });
        logger.debug('local-access submitted with: ' + JSON.stringify(data));
        this.trigger('local-access-submitted', data);
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
      }
    });
  });

  return PF.UserApp.Signup.Views;
});
