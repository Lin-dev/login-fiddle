define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var Display = require('js/app/display/obj');
  var logger = AppObj.logger.get('root/js/apps/footer/show/controller');
  logger.trace('require:lambda -- enter');

  AppObj.module('FooterApp.Show', function(Show, AppObj, Backbone, Marionette, $, _) {
    logger.trace('AppObj.module -- enter');
    Show.controller = {
      show_footer: function show_footer() {
        logger.trace('FooterApp.Show.controller.show_footer -- enter');
        var Views = require('js/apps/footer/show/views');
        var view = new Views.Footer();
        Display.tainer.show_in('footer', view);
        logger.trace('FooterApp.Show.controller.show_footer -- exit');
      }
    };
    logger.trace('AppObj.module -- exit');
  });

  logger.trace('require:lambda -- exit');
  return AppObj.FooterApp.Show.controller;
});
