define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/header/header_app');
  logger.trace('require:lambda -- enter');

  AppObj.module('HeaderApp', function(HeaderApp, AppObj, Backbone, Marionette, $, _) {
    logger.trace('AppObj.module -- enter');
    var API = {
      show_header: function show_header() {
        logger.trace('API.show_header -- enter');
        var controller = require('js/apps/header/show/controller');
        controller.show_header();
        logger.trace('API.show_header -- exit');
      },
    };

    AppObj.commands.setHandler('headerapp:set_active_navitem', function(url) {
      HeaderApp.Show.controller.set_active_navitem(url);
    });

    HeaderApp.on('start', function() {
      logger.trace('HeaderApp.event - start -- enter');
      API.show_header();
      logger.trace('HeaderApp.event - start -- exit');
    });
    logger.trace('AppObj.module -- exit');
  });

  logger.trace('require:lambda -- exit');
  return AppObj.HeaderApp;
});
