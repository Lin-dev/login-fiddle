define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/about/show/controller');
  logger.trace('require:lambda -- enter');

  AppObj.module('AboutApp.Show', function(Show, AppObj, Backbone, Marionette, $, _) {
    logger.trace('AppObj.module -- enter');
    Show.controller = {
      show_about: function show_about() {
        logger.trace('show_about -- enter');
        var Views = require('js/apps/about/show/views');
        var view = new Views.About();
        AppObj.region_main.show(view);
        AppObj.scroll_to_top();
        logger.trace('show_about -- exit');
      }
    };
    logger.trace('AppObj.module -- exit');
  });

  logger.trace('require:lambda -- exit');
  return AppObj.AboutApp.Show.controller;
});
