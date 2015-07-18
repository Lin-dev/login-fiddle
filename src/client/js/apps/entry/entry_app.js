define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/entry/entry_app');
  logger.trace('require:lambda -- enter');

  AppObj.module('EntryApp', function(EntryApp, AppObj, Backbone, Marionette, $, _) {
    logger.trace('AppObj.module -- enter');
    EntryApp.Router = Marionette.AppRouter.extend({
      appRoutes: {
        'entry(/:tag_string)': 'show_list'
      }
    });

    var API = {
      show_list: function show_list(tag_string) {
        logger.trace('API.show_list -- enter - tag_string: ' + tag_string);
        var controller = require('js/apps/entry/list/controller');
        controller.show_list(tag_string);
        AppObj.execute('headerapp:set_active_navitem', 'entry');
        logger.trace('API.show_list -- exit');
      },
    };

    AppObj.on('entry:list', function(tag_string) {
      logger.trace('AppObj.event - entry:list -- enter - tag_string: ' + tag_string);
      AppObj.navigate('entry' + (tag_string ? '/' + tag_string : ''));
      API.show_list(tag_string);
      logger.trace('AppObj.event - entry:list -- exit');
    });

    AppObj.addInitializer(function(){
      logger.trace('AppObj.addInitializer -- enter');
      (function() {
        return new EntryApp.Router({
          controller: API
        });
      }());
      logger.trace('AppObj.addInitializer -- exit');
    });
    logger.trace('AppObj.module -- exit');
  });

  logger.trace('require:lambda -- exit');
  return AppObj.EntryApp;
});
