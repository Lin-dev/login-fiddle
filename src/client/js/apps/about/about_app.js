define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/about/about_app');
  logger.trace('require:lambda -- enter');

  AppObj.module('AboutApp', function(AboutApp, AppObj, Backbone, Marionette, $, _) {
    logger.trace('AppObj.module -- enter');
    AboutApp.Router = Marionette.AppRouter.extend({
      appRoutes: {
        'about': 'show_about',
      }
    });

    var API = {
      show_about: function() {
        logger.trace('API.show_about -- enter');
        var controller = require('js/apps/about/show/controller');
        controller.show_about();
        AppObj.execute('headerapp:set_active_navitem', 'about');
        logger.trace('API.show_about -- exit');
      },
    };

    AppObj.on('about:show', function() {
      logger.trace('AppObj.event - about:show -- enter');
      AppObj.navigate('about');
      API.show_about();
      logger.trace('AppObj.event - about:show -- exit');
    });

    AppObj.addInitializer(function() {
      logger.trace('AppObj.addInitializer -- enter');
      (function() {
        return new AboutApp.Router({
          controller: API
        });
      }());
      logger.trace('AppObj.addInitializer -- exit');
    });
    logger.trace('AppObj.module -- exit');
  });

  logger.trace('require:lambda -- exit');
  return AppObj.AboutApp;
});
