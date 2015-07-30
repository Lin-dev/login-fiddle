define(function(require) {
  'use strict';

  var Backbone = require('backbone');
  var Marionette = require('marionette');
  var $ = require('jquery');
  var q = require('q'); // for setting long stack support

  // Extensions
  require('js/app/extensions/backbone');
  require('js/app/extensions/marionette');
  require('js/app/extensions/regexp');

  // Set up app object
  var AppObj = new Marionette.Application();
  AppObj.config = require('js/app/config/config');
  AppObj.logger = require('js/app/logger/logger_builder')(AppObj.config.logger);
  var logger = AppObj.logger.get('root/js/app/obj');
  logger.debug('require:lambda -- entered, AppObj built, config loaded, logger initialised');

  // Routing helpers
  /**
   * Updates the URL in the address bar - wraps Backbone.history.navigate
   */
  AppObj.navigate = function navigate(route, options) {
    options = options || {};
    Backbone.history.navigate(route, options);
  };

  /**
   * Returns current routing fragment - wraps Backbone.history.fragment
   */
  AppObj.get_current_route = function get_current_route() {
    return Backbone.history.fragment;
  };
  ////////

  // Auth helpers
  /**
   * Checks if a user is logged in (according to the cookies sent by the server)
   * @return {Boolean} True if the user is logged in and the Server user_config.logged_in_cookie_name === 'true',
   *                   false otherwise
   */
  AppObj.is_logged_in = function is_logged_in() {
    require('jquery_cookie');
    return $.cookie.get('logged_in') === 'true';
  };
  ////////

  // Promise helpers - putting them here is a bit hacky but not worth creating a separate module in common yet
  /**
   * Returns a function that can be passed into a promise fail handler to log promise failure and do other cleanup.
   * Method is currently simple but makes avoiding silent failure due to promise failure a one-liner.
   * @param  {String}   caller The function name used in logs to describe the calling location
   * @return {Function}        A function that can be passed in to a promise's fail method
   */
  AppObj.on_promise_fail_gen = function on_promise_fail_gen(caller) {
    return function on_promise_fail(err) {
      logger.error(caller + ' -- promise failed, error: ' + err);
    };
  };

  q.longStackSupport = AppObj.config.app.q_longStackSupport;
  ////////

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
