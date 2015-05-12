define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/user/access/controller');

  AppObj.module('UserApp.Access', function(Access, AppObj, Backbone, Marionette, $, _) {
    function proc_local_login(form_data, access_view, trigger_after_login) {
      // UserLocalAccess just for validation (passport redirect mucks up Backbone model sync)
      var ula = new AppObj.UserApp.Entities.UserLocalAccess({
        email: form_data.email,
        has_pw_flag: form_data.has_pw_flag,
        password: form_data.password
      });
      var validation_errors = ula.validate(ula.attributes);
      if(_.isEmpty(validation_errors)) {
        logger.debug('private.proc_local_login -- access form validation passed: ' + JSON.stringify(form_data));
        $.post('/api/user/access/local/login', form_data, function(resp_data, textStatus, jqXhr) {
          if(resp_data.status === 'success') {
            logger.debug('private.proc_local_login - /api/user/access/local/login response -- ' +
              'succeess, redirecting to profile');
            AppObj.trigger(trigger_after_login);
          }
          else if(resp_data.status === 'failure') {
            logger.debug('private.proc_local_login - /api/user/access/local/login response -- ' +
              'login failure: ' + resp_data.message);
            access_view.model.set({ message: resp_data.message });
          }
          else {
            logger.error('private.proc_local_login - /api/user/access/local/login response -- ' +
              'unknown status: ' + resp_data.status + ' (message: ' + resp_data.message + ')');
            access_view.model.set({ message: resp_data.message });
          }
        });
      }
      else {
        logger.debug('private.proc_local_login -- user form validation failed: ' + JSON.stringify(validation_errors));
        access_view.show_validation_errors(validation_errors);
      }
    }

    function proc_local_signup(form_data, signup_view, trigger_after_login) {
      var uls = new AppObj.UserApp.Entities.UserLocalSignup({
        email: form_data.email,
        email_check: form_data.email_check,
        password: form_data.password,
        password_check: form_data.password_check
      });
      var validation_errors = uls.validate(uls.attributes);
      if(_.isEmpty(validation_errors)) {
        logger.debug('private.proc_local_signup -- user form validation passed: ' + JSON.stringify(form_data));
        $.post('/api/user/access/local/signup', form_data, function(resp_data, textStatus, jqXhr) {
          if(resp_data.status === 'success') {
            logger.debug('private.proc_local_signup - /api/user/access/local/signup response -- ' +
              'succeess, redirecting to profile');
            AppObj.trigger(trigger_after_login);
          }
          else if(resp_data.status === 'failure') {
            logger.debug('private.proc_local_signup - /api/user/access/local/signup response -- ' +
              'login failure: ' + resp_data.message);
            signup_view.model.set({ message: resp_data.message });
          }
          else {
            logger.error('private.proc_local_signup - /api/user/access/local/signup response -- ' +
              'unknown status: ' + resp_data.status + ' (message: ' + resp_data.message + ')');
            signup_view.model.set({ message: resp_data.message });
          }
        });
      }
      else {
        logger.debug('private.proc_local_signup -- user form validation failed: ' + JSON.stringify(validation_errors));
        signup_view.show_validation_errors(validation_errors);
      }
    }

    Access.controller = {
      show_access_form: function(trigger_after_login) {
        logger.trace('UserApp.Access.controller.show_access_form -- enter');
        var Views = require('js/apps/user/access/views');
        // Model is needed in view so that view can be updated following if the post response is a failure
        var access_view = new Views.AccessForm({ model: new AppObj.Entities.AppObjClientOnlyModel() });
        access_view.on('home-clicked', function() { AppObj.trigger('home:show'); });
        access_view.on('local-access-submitted', function local_access_submitted(form_data) {
          require('js/apps/user/entities');

          if(form_data.has_pw_flag === 'true') { // attempt a login using email / password
            proc_local_login(form_data, access_view, trigger_after_login);
          }
          else if(form_data.has_pw_flag === 'false') { // show the signup form
            var uls = new AppObj.UserApp.Entities.UserLocalSignup({ email: form_data.email });
            var signup_view = new Views.SignupForm({ model: uls });
            signup_view.on('home-clicked', function() { AppObj.trigger('home:show'); });
            signup_view.on('login-clicked', function() { AppObj.trigger('user:login'); });
            signup_view.on('local-signup-submitted', function(form_data) {
              proc_local_signup(form_data, signup_view, trigger_after_login);
            });
            AppObj.region_main.show(signup_view);
          }
          else {
            logger.error('UserApp.Access.controller.show_access_form - local-access-submitted callback -- ' +
              'unknown has_pw_flag: ' + form_data.has_pw_flag);
          }
        });
        AppObj.region_main.show(access_view);
      }
    };
  });

  return AppObj.UserApp.Access.controller;
});
