define(function(require) {
  'use strict';

  var Backbone = require('backbone');
  var Marionette = require('marionette');

  // Set up app object
  var AppObj = new Marionette.Application();
  AppObj.config = require('js/app/config');
  AppObj.logger = require('js/app/logger_builder')(AppObj.config.logger);
  var logger = AppObj.logger.get('root/js/app/obj');
  logger.debug('require:lambda -- entered, AppObj built, config loaded, logger initialised');

  // Set up regions
  AppObj.addRegions({
    'region_navbar': 'div#region_navbar',
    'region_main': 'div#region_main',
    'region_footer': 'div#region_footer'
  });

  // Routing helpers
  /**
   * Updates the URL in the address bar - wraps Backbone.history.navigate
   */
  AppObj.navigate = function(route, options) {
    options = options || {};
    Backbone.history.navigate(route, options);
  };

  /**
   * Returns current routing fragment - wraps Backbone.history.fragment
   */
  AppObj.get_current_route = function() {
    return Backbone.history.fragment;
  };

  /**
   * Checks if a user is logged in (according to the cookies sent by the server)
   * @return {Boolean} True if the user is logged in and the Server server_config.logged_in_cookie_name === 'true',
   *                   false otherwise
   */
  AppObj.is_logged_in = function() {
    require('jquery_cookie');
    /* global $: false */
    // $ is defined by requiring jquery_cookie so ignore following line in jshint:
    return $.cookie.get('logged_in') === 'true';
  };

  // Log all events at trace
  AppObj.on('all', function(event_string) {
    var events_logger = AppObj.logger.get('root/events_logger');
    events_logger.trace('AppObj.event -- events logger: ' + event_string);
  });

  // Set application to start after initialisation
  AppObj.on('start', function(options) {
    logger.trace('AppObj.event - start -- enter');
    if(Backbone.history) {
      Backbone.history.start({ // assume router already required elsewhere, e.g. in main.js
        pushState: true
      });

      if(Backbone.history.fragment === '') {
        AppObj.trigger('home:show');
      }
    }
    else {
      logger.error('Backbone.history is falsey: ' + Backbone.history);
    }
    logger.trace('AppObj.event - start -- exit');
  });

  logger.debug('require:lambda -- exited, AppObj regions and on-start listener initialised');
  return AppObj;
});
