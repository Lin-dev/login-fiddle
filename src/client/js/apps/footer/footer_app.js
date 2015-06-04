define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/footer/footer_app');
  logger.trace('require:lambda -- enter');

  AppObj.module('FooterApp', function(FooterApp, AppObj, Backbone, Marionette, $, _) {
    logger.trace('AppObj.module -- enter');
    var API = {
      show_footer: function show_footer() {
        logger.trace('FooterApp - API.show_footer -- enter');
        var controller = require('js/apps/footer/show/controller');
        controller.show_footer();
        logger.trace('FooterApp - API.show_footer -- exit');
      },
    };

    FooterApp.on('start', function() {
      logger.trace('FooterApp.event - start -- enter');
      API.show_footer();
      logger.trace('FooterApp.event - start -- exit');
    });
    logger.trace('AppObj.module -- exit');
  });

  logger.trace('require:lambda -- exit');
  return AppObj.FooterApp;
});
