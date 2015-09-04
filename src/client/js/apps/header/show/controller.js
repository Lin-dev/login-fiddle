define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var Display = require('js/display/obj');
  var logger = AppObj.logger.get('root/js/apps/header/show/controller');
  logger.trace('require:lambda -- enter');

  AppObj.module('HeaderApp.Show', function(Show, AppObj, Backbone, Marionette, $, _) {
    logger.trace('AppObj.module -- enter');
    Show.controller = {
      show_header: function show_header() {
        logger.trace('show_header -- enter');
        require('js/apps/header/entities');
        var Views = require('js/apps/header/show/views');
        var navitem_collection_promise = AppObj.request('headerapp:entities:navitems');
        navitem_collection_promise.then(function(navitem_collection) {
          var view = new Views.Header({ collection: navitem_collection });

          view.on('brand_clicked', function() {
            logger.trace('event - brand_clicked -- enter');
            AppObj.trigger('home:show');
            logger.trace('event - brand_clicked -- exit');
          });

          view.on('childview:navigate', function(args) {
            logger.trace('event - childview:navigate -- enter w/ ' + args.model.get('nav_trigger'));
            AppObj.trigger(args.model.get('nav_trigger'));
            logger.trace('event - childview:navigate -- exit');
          });

          Display.tainer.show_in('navbar', view);
        })
        .fail(AppObj.make_on_promise_fail('HeaderApp.Show.controller.show_header'));
        logger.trace('show_header -- exit');
      },

      set_active_navitem: function set_active_navitem(url) {
        logger.debug('set_active_navitem -- setting ' + url + ' to active');
        require('backbone_picky');
        require('js/apps/header/entities');
        var navitem_collection_promise = AppObj.request('headerapp:entities:navitems');
        navitem_collection_promise
        .then(function(navitem_collection) {
          var navitem_to_select = navitem_collection.find(function(navitem) {
            return navitem.get('url') === url;
          });
          if(navitem_to_select) {
            navitem_to_select.select();
            navitem_collection.trigger('reset');
          }
          else { // deselect all nav items in this menu (navitem url is not in this menu)
            logger.warn('Navitem to select is not in main navbar: ' + url);
            navitem_collection.each(function(navitem) {
              navitem.deselect();
            });
            navitem_collection.trigger('reset');
          }
        })
        .fail(AppObj.make_on_promise_fail('HeaderApp.Show.controller.set_active_navitem'));
        logger.trace('set_active_navitem -- exit');
      }
    };
    logger.trace('AppObj.module -- exit');
  });

  logger.trace('require:lambda -- exit');
  return AppObj.HeaderApp.Show.controller;
});
