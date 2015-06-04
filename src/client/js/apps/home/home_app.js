define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/home/home_app');
  logger.trace('require:lambda -- enter');

  AppObj.module('HomeApp', function(HomeApp, AppObj, Backbone, Marionette, $, _) {
    logger.trace('AppObj.module -- enter');
    HomeApp.Router = Marionette.AppRouter.extend({
      appRoutes: {
        'home': 'show_home'
      }
    });

    var API = {
      show_home: function show_home() {
        logger.trace('API.show_home -- enter');
        var controller = require('js/apps/home/show/controller');
        controller.show_home();
        AppObj.execute('headerapp:set_active_navitem', 'home');
        logger.trace('API.show_home -- exit');
      },
    };

    AppObj.on('home:show', function() {
      logger.trace('AppObj.event - home:show -- enter');
      AppObj.navigate('home');
      API.show_home();
      logger.trace('AppObj.event - home:show -- exit');
    });

    AppObj.addInitializer(function(){
      logger.trace('AppObj.addInitializer -- enter');
      (function() {
        return new HomeApp.Router({
          controller: API
        });
      }());
      logger.trace('AppObj.addInitializer -- exit');
    });
    logger.trace('AppObj.module -- exit');
  });

  logger.trace('require:lambda -- exit');
  return AppObj.HomeApp;
});
