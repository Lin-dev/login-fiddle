define(function(require) {
  'use strict';

  var PF = require('js/app/obj');
  var logger = PF.logger.get('root/js/apps/user/access/controller');

  PF.module('UserApp.Access', function(Access, PF, Backbone, Marionette, $, _) {
    function process_local_login(form_data, access_view) {
      // UserLocalAccess just for validation (passport redirect mucks up Backbone model sync)
      var ula = new PF.UserApp.Entities.UserLocalAccess(form_data);
      var validation_errors = ula.validate(ula.attributes);
      if(_.isEmpty(validation_errors)) {
        logger.debug('private.process_local_login -- access form validation passed: ' + JSON.stringify(form_data));
        $.post('/api/user/access/local/login', form_data, function(resp_data, textStatus, jqXhr) {
          if(resp_data.status === 'success') {
            logger.debug('private.process_local_login - /access/local/login response -- ' +
              'succeess, redirecting to profile');
            PF.trigger('user:profile');
          }
          else if(resp_data.status === 'failure') {
            logger.debug('private.process_local_login - /access/local/login response -- ' +
              'login failure: ' + resp_data.message);
            logger.warn(JSON.stringify(resp_data));
            access_view.model.set({ message: resp_data.message });
          }
          else {
            logger.error('private.process_local_login - /access/local/login response -- ' +
              'unknown status: ' + resp_data.status + ' (message: ' + resp_data.message + ')');
            access_view.model.set({ message: resp_data.message });
          }
        });
      }
      else {
        logger.debug('private.process_local_login -- user validation failed: ' + JSON.stringify(validation_errors));
        access_view.show_validation_errors(validation_errors);
      }
    }

    function process_local_signup(form_data) {
      logger.debug('private.process_local_signup: ' + JSON.stringify(form_data));
      //
      //
      // TODO
      //
      //
      //
    }

    Access.controller = {
      show_access_form: function() {
        logger.trace('UserApp.Access.controller.show_access_form -- enter');
        var Views = require('js/apps/user/access/views');
        // Model is needed in view so that view can be updated following if the post response is a failure
        var access_view = new Views.AccessForm({ model: new PF.Entities.PFClientOnlyModel() });
        access_view.on('home-clicked', function() { PF.trigger('home:show'); });
        access_view.on('local-access-submitted', function local_access_submitted(form_data) {
          require('js/apps/user/entities');

          if(form_data.has_pw_flag === 'true') { // attempt a login using email / password
            process_local_login(form_data, access_view);
          }
          else if(form_data.has_pw_flag === 'false') { // show the signup form
            var uls = new PF.UserApp.Entities.UserLocalSignup({ email: form_data.email });
            var signup_view = new Views.SignupForm({ model: uls });
            signup_view.on('home-clicked', function() { PF.trigger('home:show'); });
            signup_view.on('login-clicked', function() { PF.trigger('user:login'); });
            signup_view.on('local-signup-submitted', function(form_data) { process_local_signup(form_data); });
            PF.region_main.show(signup_view);
          }
          else {
            logger.error('UserApp.Access.controller.show_access_form - local-access-submitted callback -- ' +
              'unknown has_pw_flag: ' + form_data.has_pw_flag);
          }
        });
        PF.region_main.show(access_view);
      }
    };
  });

  return PF.UserApp.Access.controller;
});
