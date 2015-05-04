define(function(require) {
  'use strict';

  var PF = require('js/app/obj');
  var logger = PF.logger.get('root/js/apps/user/access/controller');

  PF.module('UserApp.Signup', function(Signup, PF, Backbone, Marionette, $, _) {
    Signup.controller = {
      show_access_form: function() {
        logger.trace('show_access_form -- enter');
        var Views = require('js/apps/user/access/views');
        // Model is needed in view so that view can be updated following if the post response is a failure
        var view = new Views.SignupForm({ model: new PF.Entities.PFClientOnlyModel() });
        view.on('login-clicked', function() { PF.trigger('user:login'); });
        view.on('home-clicked', function() { PF.trigger('home:show'); });
        view.on('local-access-submitted', function(submitted_data) {
          require('js/apps/user/entities');
          // UserLocalSignup just for validation (passport redirect mucks up Backbone model sync)
          var new_user = new PF.UserApp.Entities.UserLocalSignup(submitted_data);
          var validation_errors = new_user.validate(new_user.attributes);
          if(_.isEmpty(validation_errors)) {
            logger.debug('User validation passed - no errors');
            $.post('/api/user/access/local', submitted_data, function(resp_data, textStatus, jqXhr) {
              if(resp_data.status === 'success') {
                logger.debug('UserApp.Signup - local_access post response -- access succeess, redirecting to profile');
                PF.trigger('user:profile');
              }
              else if(resp_data.status === 'failure') { // duplicate email, server side validation error or ?
                logger.debug('UserApp.Signup - local_access post response -- access failure: ' + resp_data.message);
                view.model.set({ message: resp_data.message });
              }
              else {
                logger.error('UserApp.Signup - local_access post response -- unknown status: ' + resp_data.status +
                  ' (message: ' + resp_data.message + ')');
              }
            });
          }
          else {
            logger.debug('User validation failed: ' + JSON.stringify(validation_errors));
            view.show_validation_errors(validation_errors);
          }
        });
        PF.region_main.show(view);
      }
    };
  });

  return PF.UserApp.Signup.controller;
});
