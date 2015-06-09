define(function(require) {
  'use strict';

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/user/access/controller');

  AppObj.module('UserApp.Access', function(Access, AppObj, Backbone, Marionette, $, _) {
    /**
     * Returns a user-displayable explanation of why the access form is being displayed again (i.e. they refused
     * permission at same oauth provider)
     * @param  {String} query_string The query string code included in the URL query string the server redirects to
     * @return {String}              A user-displayable explanation of why the access form is being displayed again
     */
    function get_decline_msg_from_query_string_reason(query_string) {
      var parsed_query = Marionette.parse_query_string(query_string);
      switch(parsed_query && parsed_query.reason) {
        case undefined: return undefined;
        case 'fb_declined': return 'Facebook login cancelled';
        case 'twitter_declined': return 'Twitter login cancelled';
        case 'google_declined': return 'Google login cancelled';
        default:
          logger.error('private.get_decline_msg_from_query_string_reason -- unknown reason: ' + parsed_query.reason);
          return 'Unknown error reason: ' + parsed_query.reason;
      }
    }

    /**
     * Gets the facebook display mode string to use based on the client window size
     * TODO: Duplicated in user/access and user/profile controllers - de-duplicate on next edit
     * @param  {String} ui_scale The UI scale as returned by `Marionette.get_ui_scale()`
     * @return {String}          The facebook display mode to render the auth request in
     */
    function get_facebook_google_display_mode_from_ui_scale(ui_scale) {
      switch(ui_scale) {
        case 'mobile': return 'touch';
        case 'tablet': return 'touch';
        case 'smalldesk': return 'page';
        case 'bigdesk': return 'page';
        default:
          logger.error('private.get_facebook_google_display_mode_from_ui_scale -- unknown UI scale: ' + ui_scale);
          return 'touch';
      }
    }

    /**
     * Returns the string to set the client browser location to, to request auth from FB. Is the
     * server API endpoint, which in turn generates and redirects to FB
     */
    function get_facebook_auth_url() {
      return AppObj.config.apps.user.facebook_auth_url + '?display=' +
        get_facebook_google_display_mode_from_ui_scale(Marionette.get_ui_scale());
    }

    /**
     * Returns the string to set the client browser location to, to request auth from Google. Is the
     * server API endpoint, which in turn generates and redirects to Google
     */
    function get_google_auth_url() {
      return AppObj.config.apps.user.google_auth_url + '?display=' +
        get_facebook_google_display_mode_from_ui_scale(Marionette.get_ui_scale());
    }

    /**
     * Returns the string to set the client browser location to, to request auth from Twitter. Is the
     * server API endpoint, which in turn generates and redirects to Twitter
     */
    function get_twitter_auth_url() {
      return AppObj.config.apps.user.twitter_auth_url;
    }

    /**
     * Process a FB login request - redirect the client browser to the facebook auth request URL
     */
    function proc_facebook_login() {
      logger.trace('private.proc_facebook_login -- redirecting to facebook');
      window.location.href = get_facebook_auth_url();
    }

    /**
     * Process a Google login request - redirect the client browser to the Google auth request URL
     */
    function proc_google_login() {
      logger.trace('private.proc_facebook_login -- redirecting to Google');
      window.location.href = get_google_auth_url();
    }

    /**
     * Process a twitter login request - redirect the client browser to the twitter auth request URL
     */
    function proc_twitter_login() {
      logger.trace('private.proc_twitter_login -- redirecting to twitter');
      window.location.href = get_twitter_auth_url();
    }

    /**
     * Process a local login request
     * @param  {Object} form_data           An object with a key for each form data field
     * @param  {Object} signup_view         The view (whose model should be updated with any validation errors)
     * @param  {String} trigger_after_login The navigation event that should be triggered after successful login
     */
    function proc_local_login(form_data, access_view, trigger_after_login) {
      // UserLocalAccess just for validation (passport redirect mucks up Backbone model sync)
      var ula = new AppObj.UserApp.Entities.UserLocalAccess({
        local_email: form_data.local_email,
        has_pw_flag: form_data.has_pw_flag,
        local_password: form_data.local_password
      });
      var validation_errors = ula.validate(ula.attributes);
      if(_.isEmpty(validation_errors)) {
        logger.debug('private.proc_local_login -- access form validation passed: ' + JSON.stringify(form_data));
        $.post('/api/user/access/local/login', form_data, function(resp_data, textStatus, jqXhr) {
          if(resp_data.status === 'success') {
            logger.debug('private.proc_local_login - /api/user/access/local/login response -- ' +
              'succeess, redirecting to: ' + trigger_after_login);
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

    /**
     * Process a local signup request, validating it and synchronising to the DB
     * @param  {Object} form_data           An object with a key for each form data field
     * @param  {Object} signup_view         The view (whose model should be updated with any validation errors)
     * @param  {String} trigger_after_login The navigation event that should be triggered after successful login
     */
    function proc_local_signup(form_data, signup_view, trigger_after_login) {
      var uls = new AppObj.UserApp.Entities.UserLocalSignup({
        local_email: form_data.local_email,
        local_email_check: form_data.local_email_check,
        local_password: form_data.local_password,
        local_password_check: form_data.local_password_check
      });
      var validation_errors = uls.validate(uls.attributes);
      if(_.isEmpty(validation_errors)) {
        logger.debug('private.proc_local_signup -- user form validation passed: ' + JSON.stringify(form_data));
        $.post('/api/user/access/local/signup', form_data, function(resp_data, textStatus, jqXhr) {
          if(resp_data.status === 'success') {
            logger.debug('private.proc_local_signup - /api/user/access/local/signup response -- ' +
              'succeess, redirecting to: ' + trigger_after_login);
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
      /**
       * Display the access form, allowing users to sign up and login
       * @param  {String} query_string        Used so the server can send a reason code to trigger a message display
       * @param  {String} trigger_after_login The navigation event that should be triggered after successful login
       */
      show_access_form: function show_access_form(query_string, trigger_after_login) {
        logger.trace('show_access_form -- query_string: ' + query_string + ', trigger_after_login: ' +
          trigger_after_login);
        if(!trigger_after_login) { // not strict === because might be null
          trigger_after_login = 'user:profile';
        }
        var Views = require('js/apps/user/access/views');
        // Model is needed in view so that view can be updated following if the post response is a failure
        var access_view = new Views.AccessForm({ model: new AppObj.Entities.ClientModel({
          facebook_url: get_facebook_auth_url(),
          google_url: get_google_auth_url(),
          twitter_url: get_twitter_auth_url(),
          message: get_decline_msg_from_query_string_reason(query_string)
        })});
        access_view.on('home-clicked', function() { AppObj.trigger('home:show'); });
        access_view.on('facebook-access-clicked', function facebook_access_clicked() { proc_facebook_login(); });
        access_view.on('google-access-clicked', function google_access_clicked() { proc_google_login(); });
        access_view.on('twitter-access-clicked', function twitter_access_clicked() { proc_twitter_login(); });
        access_view.on('local-access-submitted', function local_access_submitted(form_data) {
          require('js/apps/user/entities');

          if(form_data.has_pw_flag === 'true') { // attempt a login using email / password
            proc_local_login(form_data, access_view, trigger_after_login);
          }
          else if(form_data.has_pw_flag === 'false') { // show the signup form if email address valid
            var email_validation = new AppObj.UserApp.Entities.UserLocalAccess();
            var validation_errors = email_validation.validate(form_data);
            if(_.isEmpty(validation_errors)) {
              var uls = new AppObj.UserApp.Entities.UserLocalSignup({ local_email: form_data.local_email });
              var signup_view = new Views.SignupForm({ model: uls });
              signup_view.on('home-clicked', function() { AppObj.trigger('home:show'); });
              signup_view.on('login-clicked', function() { AppObj.trigger('user:login'); });
              signup_view.on('local-signup-submitted', function(form_data) {
                proc_local_signup(form_data, signup_view, trigger_after_login);
              });
              AppObj.region_main.show(signup_view);
            }
            else {
              logger.debug('show_access_form -- user form validation failed: invalid email address for signup' +
                JSON.stringify(validation_errors));
              access_view.show_validation_errors(validation_errors);
            }
          }
          else {
            logger.error('show_access_form - local-access-submitted callback -- ' + 'unknown has_pw_flag: ' +
              form_data.has_pw_flag);
          }
        });
        AppObj.region_main.show(access_view);
      }
    };
  });

  return AppObj.UserApp.Access.controller;
});
