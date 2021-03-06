define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/common/views');
  logger.trace('require:lambda -- enter');

  AppObj.module('Common.Views', function(Views, AppObj, Backbone, Marionette, $, _) {
    logger.trace('AppObj.module -- enter');
    require('js/base/views');

    /**
     * A base view for any view containing a form whose values need to be validated
     */
    Views.AppObjFormItemView = AppObj.Base.Views.AppObjItemView.extend({
      __name: 'AppObjFormItemView',

      /** Check __form_element_id_prefix is set - expect sub classes with custom initialise to call this */
      initialize: function initialize() {
        if(this.__form_element_id_prefix === undefined) {
          logger.error('AppObjFormItemView.initialize -- __form_element_id_prefix is undefined, subclass must define');
        }
      },

      show_val_errs: function show_val_errs(val_errs) {
        if(this.__form_element_id_prefix === undefined) {
          // Backup check in case AppObjFormItemView extending object overrides initialize and doesn't call super
          // initialize
          logger.error('AppObjFormItemView.initialize -- __form_element_id_prefix is undefined, subclass must define');
        }
        var $view = this.$el;
        /** Remove all error messages added to form */
        var clear_form_errs = function clear_form_errs(){
          var $form = $view.find('form');
          $form.find('.js-validation-message').each(function(){
            $(this).remove();
          });
          $form.find('.form-group.has-error').each(function(){
            $(this).removeClass('has-error');
          });
        };
        /** Add error message `value` to form for field `key` */
        var that = this;
        var mark_err = function mark_err(value, key){
          var $form_group = $view.find('#' + that.__form_element_id_prefix + key).parent();
          var $errorEl = $('<span>', {class: 'js-validation-message help-block', text: value});
          $form_group.append($errorEl).addClass('has-error');
        };
        clear_form_errs();
        _.each(val_errs, mark_err);
      }
    });

    /**
     * A view component that can be used in many layouts to display a flash message
     */
    Views.FlashMessageView = AppObj.Base.Views.AppObjItemView.extend({
      __name: 'FlashMessageView',
      template: _.template(require('text!js/common/templates/flash_message.html'), { variable: 'data' }),
      triggers: {
        /** Allows an action link to be embedded in a flash message and listened to via JavaScript */
        'click a.js-action-link': 'action-link-clicked'
      }
    });

    /**
     * A view component for displaying the version info. The template expects to receive: data.datestring,
     * data.npm_version, data.git_describe
     */
    Views.VersionInfoView = AppObj.Base.Views.AppObjItemView.extend({
      __name: 'VersionInfoView',
      template: _.template(require('text!js/common/templates/version_info.html'), { variable: 'data' })
    });

    /**
     * Display a simple, static text header in an h1 element
     */
    Views.H1Header = AppObj.Base.Views.AppObjItemView.extend({
      __name: 'H1Header',
      template: _.template(require('text!js/common/templates/h1_header.html'), { variable: 'data' })
    });

    /**
     * A confirmation prompt (can be used modelessly)
     */
    Views.ConfirmationPrompt = AppObj.Base.Views.AppObjItemView.extend({
      __name: 'ConfirmationPrompt',
      template: _.template(require('text!js/common/templates/confirmation_prompt.html'), { variable: 'data' }),
      triggers: {
        'click a.js-confirm': 'confirm-clicked',
        'click a.js-reject': 'reject-clicked'
      }
    });
    logger.trace('AppObj.module -- exit');
  });
  logger.trace('require:lambda -- exit');
  return AppObj.Common.Views;
});
