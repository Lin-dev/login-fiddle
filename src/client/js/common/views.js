define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/common/views');
  logger.trace('require:lambda -- enter');

  AppObj.module('Common.Views', function(Views, AppObj, Backbone, Marionette, $, _) {
    logger.trace('AppObj.module -- enter');
    Views.AppObjItemView = Marionette.ItemView.extend({ __name: 'AppObjItemView' });
    Views.AppObjCollectionView = Marionette.CollectionView.extend({ __name: 'AppObjCollectionView' });
    Views.AppObjCompositeView = Marionette.CompositeView.extend({ __name: 'AppObjCompositeView' });
    Views.AppObjLayout = Marionette.LayoutView.extend({ __name: 'AppObjLayout' });
    Views.AppObjRegion = Marionette.Region.extend({ __name: 'AppObjRegion' });

    Views.AppObjFormItemView = Views.AppObjItemView.extend({
      __name: 'AppObjFormItemView',

      /** Check __form_element_id_prefix is set - expect sub classes with custom initialise to call this */
      initialize: function() {
        if(this.__form_element_id_prefix === undefined) {
          logger.error('AppObjFormItemView.initialize -- __form_element_id_prefix is undefined, subclass must define');
        }
      },

      show_validation_errors: function(validation_errors) {
        if(this.__form_element_id_prefix === undefined) {
          // Backup check in case AppObjFormItemView extending object overrides initialize and doesn't call super
          // initialize
          logger.error('AppObjFormItemView.initialize -- __form_element_id_prefix is undefined, subclass must define');
        }
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
        var that = this;
        var mark_error = function(value, key){
          var $form_group = $view.find('#' + that.__form_element_id_prefix + key).parent();
          var $errorEl = $('<span>', {class: 'js-validation-message help-block', text: value});
          $form_group.append($errorEl).addClass('has-error');
        };
        clear_form_errors();
        _.each(validation_errors, mark_error);
      }
    });
    logger.trace('AppObj.module -- exit');
  });
  logger.trace('require:lambda -- exit');
  return AppObj.Common.Views;
});
