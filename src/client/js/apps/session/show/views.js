define(function(require) {
  'use strict';

  var PF = require('js/app/obj');
  //var logger = PF.logger.get('root/js/apps/session/show/view');

  PF.module('SessionApp.Show.Views', function(Views, PF, Backbone, Marionette, $, _) {
    require('js/common/views');

    Views.SessionInfoView = PF.Common.Views.PFItemView.extend({
      __name: 'SessionView',
      template: _.template(require('text!js/apps/session/show/templates/session.html'))
    });
  });

  return PF.SessionApp.Show.Views;
});
