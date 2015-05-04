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
  'js/app/obj',
  'js/apps/footer/footer_app',
  'js/apps/header/header_app',
  'js/apps/home/home_app',
  'js/apps/about/about_app',
  'js/apps/entry/entry_app',
  'js/apps/session/session_app',
  'js/apps/user/user_app'
], function(PF){
  'use strict';

  var logger = PF.logger.get('root/js/main');
  logger.trace('require:lambda -- enter');
  /**
   * Escapes a string for use in a regular expression
   * @param  {String} s The string to be escaped
   * @return {String}   A string which can be used in a JS regex, it will match occurrences of `s`
   */
  RegExp.escape_text= function(s) {
      return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  };
  PF.start();
  logger.trace('require:lambda -- exit');
});
