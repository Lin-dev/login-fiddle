define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  //var logger = AppObj.logger.get('root/js/apps/session/show/view');

  AppObj.module('SessionApp.Show.Views', function(Views, AppObj, Backbone, Marionette, $, _) {
    require('js/common/views');

    Views.SessionInfoView = AppObj.Common.Views.AppObjItemView.extend({
      __name: 'SessionView',
      template: _.template(require('text!js/apps/session/show/templates/session.html'))
    });
  });

  return AppObj.SessionApp.Show.Views;
});
