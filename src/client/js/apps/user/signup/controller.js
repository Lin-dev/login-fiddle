define(function(require) {
  'use strict';

  var PF = require('js/app/obj');
  var logger = PF.logger.get('root/js/apps/user/signup/controller');

  PF.module('UserApp.Signup', function(Signup, PF, Backbone, Marionette, $, _) {
    Signup.controller = {
      show_signup_form: function() {
        logger.trace('show_signup_form -- enter');
        var Views = require('js/apps/user/signup/views');
        var view = new Views.SignupForm();
        view.on('login-clicked', function() { PF.trigger('user:login'); });
        view.on('home-clicked', function() { PF.trigger('home:show'); });
        view.on('local-signup-submitted', function(data) {
          console.log('FORM SUBMITTED - need to use data in here as part of an API submission');
        });
        PF.region_main.show(view);
      }
    };
  });

  return PF.UserApp.Signup.controller;
});
