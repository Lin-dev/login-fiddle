define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/header/show/view');
  logger.trace('require:lambda -- enter');

  AppObj.module('HeaderApp.Show.Views', function(Views, AppObj, Backbone, Marionette, $, _) {
    logger.trace('AppObj.module -- enter');
    require('js/common/views');

    Views.NavItemView = AppObj.Base.Views.AppObjItemView.extend({
      __name: 'NavItemView',
      template: _.template(require('text!js/apps/header/show/templates/navitem.html')),
      tagName: 'li',

      triggers: {
        'click a.js-navitem': 'navigate'
      },

      onRender: function onRender() {
        if(this.model.selected) {
          this.$el.addClass('active');
        }
      }
    });

    Views.Header = AppObj.Base.Views.AppObjCompositeView.extend({
      __name: 'Header',
      template: _.template(require('text!js/apps/header/show/templates/header.html')),
      childView: Views.NavItemView,
      childViewContainer: 'ul.js-navbar-items',

      triggers: {
        'click a.js-brand': 'brand_clicked'
      }
    });

    logger.trace('AppObj.module -- exit');
  });

  logger.trace('require:lambda -- exit');
  return AppObj.HeaderApp.Show.Views;
});
