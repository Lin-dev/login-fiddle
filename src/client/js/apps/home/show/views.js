define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/home/show/view');
  logger.trace('require:lambda -- enter');

  AppObj.module('HomeApp.Show.Views', function(Views, AppObj, Backbone, Marionette, $, _) {
    logger.trace('AppObj.module -- enter');
    require('js/common/views');

    Views.HomeLayout = AppObj.Common.Views.AppObjLayout.extend({
      __name: 'HomeLayout',
      template: _.template(require('text!js/apps/home/show/templates/home_layout.html'), { variable: 'data' }),
      regions: {
        region_message: 'div.js-flash-message',
        region_home_main: 'div.js-home-main',
      }
    });

    Views.Home = AppObj.Common.Views.AppObjItemView.extend({
      template: _.template(require('text!js/apps/home/show/templates/home.html')),
    });
    logger.trace('AppObj.module -- exit');
  });

  logger.trace('require:lambda -- exit');
  return AppObj.HomeApp.Show.Views;
});
