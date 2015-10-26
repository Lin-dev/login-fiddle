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
        var msg_promise = AppObj.request('common:entities:flashmessage');
        var vi_promise = AppObj.request('common:entities:versioninfo');

        q.all([msg_promise, vi_promise])
        .spread(function(flash_message_model, version_info_model) {
          var CommonViews = require('js/common/views');
          var HomeViews = require('js/apps/home/show/views');
          var home_layout = new HomeViews.HomeLayout();
          var msg_view = new CommonViews.FlashMessageView({ model: flash_message_model });
          var home_view = new HomeViews.Home();
          var vi_view = new CommonViews.VersionInfoView({ model: version_info_model });
          home_layout.on('render', function() {
            home_layout.region_message.show(msg_view);
            home_layout.region_home_main.show(home_view);
            home_layout.region_version_info.show(vi_view);
          });
          Display.tainer.show_in('main', home_layout);
          logger.trace('show_home -- done');
        })
        .fail(AppObj.handle_rejected_promise.bind(undefined, 'HomeApp.show.controller.show_home'))
        .done();
      }
    };
    logger.trace('AppObj.module -- exit');
  });

  logger.trace('require:lambda -- exit');
  return AppObj.HomeApp.Show.controller;
});
