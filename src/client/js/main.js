require.config({
  baseUrl: '/',
  shim: {
    bootstrap: {
      deps: ['jquery'],
      exports: '$.fn.popover'
    },
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    backbone_picky: ['backbone'],
    backbone_syphon: ['backbone'],
    jquery_cookie: {
      deps: ['jquery'],
      exports: '$.cookie'
    },
    marionette: {
      deps: ['jquery', 'underscore', 'backbone'],
      exports: 'Marionette'
    },
    underscore: {
      exports: '_'
    }
  },
  paths: {
    backbone: '/bower_components/backbone/backbone',
    backbone_picky: '/bower_components/backbone.picky/lib/amd/backbone.picky.min',
    backbone_syphon: '/bower_components/backbone.syphon/lib/backbone.syphon.min',
    bootstrap: '/bower_components/bootstrap/dist/js/bootstrap',
    jquery: '/bower_components/jquery/dist/jquery',
    jquery_cookie: '/bower_components/js-cookie/src/js.cookie',
    marionette: '/bower_components/marionette/lib/backbone.marionette',
    moment: '/bower_components/moment/min/moment-with-locales.min',
    q: '/bower_components/q/q',
    text: '/bower_components/requirejs-text/text',
    underscore: '/bower_components/underscore/underscore',
    validator: '/bower_components/validator-js/validator.min'
  },
  urlArgs: 'bust=' + (new Date()).getTime() // development only
});

require([
  'jquery',
  'marionette',
  'js/app/obj',
  'js/apps/footer/footer_app',
  'js/apps/header/header_app',
  'js/apps/home/home_app',
  'js/apps/about/about_app',
  'js/apps/entry/entry_app',
  'js/apps/session/session_app',
  'js/apps/user/user_app'
], function($, Marionette, AppObj){
  'use strict';
  var logger = AppObj.logger.get('root/js/main');
  logger.trace('require:lambda -- enter');

  /**
   * Returns the client browser window scale (mobile, tablet, smalldesk or bigdesk) based on dummy DOM elements
   * and some media CSS queries. get_ui_scale is assigned to Marionette not AppObj because may be used in custom
   * Marionette classes, e.g. a modal dialog region
   * @return {String} One of 'mobile', 'tablet', 'smalldesk' or 'bigdesk' (or 'unknown' in the case of an error)
   */
  Marionette.get_ui_scale = function() {
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
   * Escapes a string for use in a regular expression
   * @param  {String} s The string to be escaped
   * @return {String}   A string which can be used in a JS regex, it will match occurrences of `s`
   */
  RegExp.escape_text= function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  };

  AppObj.start();
  logger.trace('require:lambda -- exit');
});
