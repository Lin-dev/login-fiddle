define(function(require) {
  'use strict';

  var PF = require('js/app/obj');
  var logger = PF.logger.get('root/js/apps/user/signup/controller');

  PF.module('UserApp.Signup', function(Signup, PF, Backbone, Marionette, $, _) {
    var process_signup_response = function(data, textStatus, jqXhr) {
      if(data.status === 'success') {
        logger.debug('UserApp.Signup - process_signup_response -- signup status: ' + data.status);
      }
      else if(data.status === 'failure') {
        logger.debug('UserApp.Signup - process_signup_response -- signup status: ' + data.status);
      }
      else {
        logger.warn('UserApp.Signup - process_signup_response -- unknown status: ' + data.status);
      }
    };

    Signup.controller = {
      show_signup_form: function() {
        logger.trace('show_signup_form -- enter');
        var Views = require('js/apps/user/signup/views');
        var view = new Views.SignupForm();
        view.on('login-clicked', function() { PF.trigger('user:login'); });
        view.on('home-clicked', function() { PF.trigger('home:show'); });
        view.on('local-signup-submitted', function(data) {
          $.post('https://localhost:27974/api/user/signup', data, process_signup_response);
        });
        PF.region_main.show(view);
      }
    };
  });

  return PF.UserApp.Signup.controller;
});
