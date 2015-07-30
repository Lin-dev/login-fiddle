define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');

  AppObj.module('Display', function(Display, AppObj, Backbone, Marionette, $, _) {
    var Views = require('js/display/views');
    Display.tainer = new Views.AppLayoutContainer({
      el: 'div#app-region'
    });
    Display.tainer.render();
    Display.tainer.set_layout(new Views.AppMenuBarLayout());
  });

  return AppObj.Display;
});
