define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/footer/show/view');
  logger.trace('require:lambda -- enter');

  AppObj.module('FooterApp.Show.Views', function(Views, AppObj, Backbone, Marionette, $, _) {
    logger.trace('AppObj.module -- enter');
    require('js/common/views');

    Views.Footer = AppObj.Base.Views.AppObjItemView.extend({
      template: _.template(require('text!js/apps/footer/show/templates/footer.html')),
    });
    logger.trace('AppObj.module -- exit');
  });

  logger.trace('require:lambda -- exit');
  return AppObj.FooterApp.Show.Views;
});
