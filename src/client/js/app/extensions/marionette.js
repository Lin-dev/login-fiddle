// NO LOGGING IN THIS FILE

/**
 * This adds utility methods to the Marionette object. It returns undefined because it alters the global object.
 */
define(function(require) {
  'use strict';
  var _ = require('underscore');
  var $ = require('jquery');
  var Marionette = require('marionette');

  /**
   * Returns the client browser window scale (mobile, tablet, smalldesk or bigdesk) based on dummy DOM elements
   * and some media CSS queries. get_ui_scale is assigned to Marionette not AppObj because may be used in custom
   * Marionette classes, e.g. a modal dialog region
   * @return {String} One of 'mobile', 'tablet', 'smalldesk' or 'bigdesk' (or 'unknown' in the case of an error)
   */
  Marionette.get_ui_scale = function get_ui_scale() {
    if($('div.test_size#mobile').css('display') === 'none') {
      return 'mobile';
    }
    else if($('div.test_size#tablet').css('display') === 'none') {
      return 'tablet';
    }
    else if($('div.test_size#smalldesk').css('display') === 'none') {
      return 'smalldesk';
    }
    else if($('div.test_size#bigdesk').css('display') === 'none') {
      return 'bigdesk';
    }
    else {
      return 'unknown';
    }
  };

  /**
   * Parses a URL query string
   * @param  {String} query_string A URL query string, e.g. '?variable=foo&another_variable=bar'
   * @return {Object}              An object with a key/string value pair for each variable in the query string
   */
  Marionette.parse_query_string = function parse_query_string(query_string) {
    if(!_.isString(query_string)) { return undefined; }
    query_string = query_string.substring(query_string.indexOf('?') + 1);
    var params = {};
    var query_parts = decodeURI(query_string).split(/&/g);
    _.each(query_parts, function(val) {
      var parts = val.split('=');
      if(parts.length >= 1) {
        val = undefined;
        if (parts.length === 2) {
          val = parts[1];
        }
        params[parts[0]] = val;
      }
    });
    return params;
  };

  return undefined;
});
