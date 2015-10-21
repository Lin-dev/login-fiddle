define(function(require) {
  'use strict';

  var q = require('q');

  var AppObj = require('js/app/obj');
  var Display = require('js/display/obj');
  var logger = AppObj.logger.get('root/js/apps/home/show/controller');
  logger.trace('require:lambda -- enter');

  AppObj.module('HomeApp.Show', function(Show, AppObj, Backbone, Marionette, $, _) {
    logger.trace('AppObj.module -- enter');
    Show.controller = {
      show_home: function show_home() {
        logger.trace('show_home -- enter');
        require('js/common/entities');
        q(AppObj.request('common:entities:flashmessage'))
        .then(function(flash_message_model) {
          var CommonViews = require('js/common/views');
          var HomeViews = require('js/apps/home/show/views');
          var home_layout = new HomeViews.HomeLayout();
          var msg_view = new CommonViews.FlashMessageView({ model: flash_message_model });
          var home_view = new HomeViews.Home();
          home_layout.on('render', function() {
            home_layout.region_message.show(msg_view);
            home_layout.region_home_main.show(home_view);
          });
          Display.tainer.show_in('main', home_layout);
          logger.trace('show_home -- done');
        })
        .fail(AppObj.make_on_promise_fail('HomeApp.Show.controller.show_home'))
        .done();
      }
    };
    logger.trace('AppObj.module -- exit');
  });

  logger.trace('require:lambda -- exit');
  return AppObj.HomeApp.Show.controller;
});
