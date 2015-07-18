define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/about/show/view');
  logger.trace('require:lambda -- enter');

  AppObj.module('AboutApp.Show.Views', function(Views, AppObj, Backbone, Marionette, $, _) {
    logger.trace('AppObj.module -- enter');
    require('js/common/views');

    Views.About = AppObj.Common.Views.AppObjItemView.extend({
      template: _.template(require('text!js/apps/about/show/templates/about.html')),
    });
    logger.trace('AppObj.module -- exit');
  });

  logger.trace('require:lambda -- exit');
  return AppObj.AboutApp.Show.Views;
});
