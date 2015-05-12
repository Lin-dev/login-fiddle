define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/home/show/controller');
  logger.trace('require:lambda -- enter');

  AppObj.module('HomeApp.Show', function(Show, AppObj, Backbone, Marionette, $, _) {
    logger.trace('AppObj.module -- enter');
    Show.controller = {
      show_home: function() {
        logger.trace('show_home -- enter');
        var Views = require('js/apps/home/show/views');
        var view = new Views.Home();
        AppObj.region_main.show(view);
        logger.trace('show_home -- exit');
      }
    };
    logger.trace('AppObj.module -- exit');
  });

  logger.trace('require:lambda -- exit');
  return AppObj.HomeApp.Show.controller;
});
