define(function(require) {
  'use strict';

  var q = require('q');

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/user/access/controller');

  AppObj.module('UserApp.Access', function(Access, AppObj, Backbone, Marionette, $, _) {
    /**
     * Gets the fb display mode string to use based on the client window size
     * TODO: Duplicated in user/access and user/profile controllers - de-duplicate on next edit
     * @param  {String} ui_scale The UI scale as returned by `Marionette.get_ui_scale()`
     * @return {String}          The fb display mode to render the auth request in
     */
    function get_fb_google_display_mode_from_ui_scale(ui_scale) {
      switch(ui_scale) {
        case 'mobile': return 'touch';
        case 'tablet': return 'touch';
        case 'smalldesk': return 'page';
        case 'bigdesk': return 'page';
        default:
          logger.error('private.get_fb_google_display_mode_from_ui_scale -- unknown UI scale: ' + ui_scale);
          return 'touch';
      }
    }

    /**
     * Returns the string to set the client browser location to, to request auth from FB. Is the
     * server API endpoint, which in turn generates and redirects to FB
     */
    function get_fb_auth_url() {
      return AppObj.config.apps.user.fb_auth_url + '?display=' +
        get_fb_google_display_mode_from_ui_scale(Marionette.get_ui_scale());
    }

    /**
     * Returns the string to set the client browser location to, to request auth from Google. Is the
     * server API endpoint, which in turn generates and redirects to Google
     */
    function get_google_auth_url() {
      return AppObj.config.apps.user.google_auth_url + '?display=' +
        get_fb_google_display_mode_from_ui_scale(Marionette.get_ui_scale());
    }

    /**
     * Returns the string to set the client browser location to, to request auth from Twitter. Is the
     * server API endpoint, which in turn generates and redirects to Twitter
     */
    function get_twitter_auth_url() {
      return AppObj.config.apps.user.twitter_auth_url;
    }

    /**
     * Process a FB login request - redirect the client browser to the fb auth request URL
     */
    function proc_fb_login() {
      logger.trace('private.proc_fb_login -- redirecting to fb');
      window.location.href = get_fb_auth_url();
    }

    /**
     * Process a Google login request - redirect the client browser to the Google auth request URL
     */
    function proc_google_login() {
      logger.trace('private.proc_fb_login -- redirecting to Google');
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
     * Respond to the local access form submission (either for signup or login)
     * @param  {Object} form_data           The submitted form data serialised as an object using syphon
     * @param  {Object} access_view         The instance of AccessViews.AccessLayout that is rendered already
     * @param  {String} trigger_after_login The event trigger to fire after a succesful login
     */
    function proc_local_access_submitted(form_data, access_view, trigger_after_login) {
      if(form_data.has_pw_flag === 'true') { // attempt a login using email / password
        proc_local_login(form_data, access_view, trigger_after_login);
      }
      else if(form_data.has_pw_flag === 'false') { // show the signup form if email address valid
        require('js/apps/user/entities');
        var email_validation = new AppObj.UserApp.Entities.UserLocalAccess();
        var val_errs = email_validation.validate(form_data);
        if(_.isEmpty(val_errs)) {
          var CommonViews = require('js/common/views');
          var AccessViews = require('js/apps/user/access/views');
          var signup_header = new CommonViews.H1Header({ model: new AppObj.Entities.ClientModel({
            header_text: 'Sign up'
          })});
          var signup_view = new AccessViews.SignupForm({
            model: new AppObj.UserApp.Entities.UserLocalSignup({ local_email: form_data.local_email })
          });
          signup_view.on('home-clicked', function() { AppObj.trigger('home:show'); });
          signup_view.on('login-clicked', function() { AppObj.trigger('user:access'); });
          signup_view.on('local-signup-submitted', function(form_data) {
            proc_local_signup(form_data, signup_view, trigger_after_login);
          });
          signup_view.on('signup_form:show_val_errs', function(val_errs) {
            signup_view.show_val_errs.call(signup_view, val_errs);
          });
          access_view.region_header.show(signup_header);
          // no message to show in region_message
          access_view.region_form.show(signup_view);
        }
        else {
          logger.debug('show_access_form -- user form validation failed: invalid email address for signup' +
            JSON.stringify(val_errs));
          access_view.trigger('access_form:show_val_errs', val_errs);
        }
      }
      else {
        logger.error('show_access_form - local-access-submitted callback -- ' + 'unknown has_pw_flag: ' +
          form_data.has_pw_flag);
      }
    }

    /**
     * Process a local login request
     * @param  {Object} form_data           An object with a key for each form data field
     * @param  {Object} access_view         The layout view (whose access_form in region_main should show val errors)
     * @param  {String} trigger_after_login The navigation event that should be triggered after successful login
     */
    function proc_local_login(form_data, access_view, trigger_after_login) {
      // UserLocalAccess just for validation (passport redirect mucks up Backbone model sync)
      var ula = new AppObj.UserApp.Entities.UserLocalAccess({
        local_email: form_data.local_email,
        has_pw_flag: form_data.has_pw_flag,
        local_password: form_data.local_password
      });
      var val_errs = ula.validate(ula.attributes);
      if(_.isEmpty(val_errs)) {
        logger.debug('private.proc_local_login -- access form validation passed: ' + JSON.stringify(form_data));
        $.post('/api/user/access/local/login', form_data, function(resp_data, textStatus, jqXhr) {
          if(resp_data.status === 'success') {
            logger.debug('private.proc_local_login - /api/user/access/local/login response -- ' +
              'succeess, redirecting to: ' + trigger_after_login);
            AppObj.trigger(trigger_after_login);
          }
          else if(resp_data.status === 'failure') {
            logger.debug('private.proc_local_login - /api/user/access/local/login response -- login failure');
            q(AppObj.request('common:entities:flashmessage'))
            .then(function(flash_message_model) {
              var CommonViews = require('js/common/views');
              var msg_view = new CommonViews.FlashMessageView({ model: flash_message_model });
              access_view.region_message.show(msg_view);
            });
          }
          else {
            logger.error('private.proc_local_login - /api/user/access/local/login response -- ' +
              'unknown status: ' + resp_data.status + ' (message: ' + resp_data.message + ')');
            q(AppObj.request('common:entities:flashmessage'))
            .then(function(flash_message_model) {
              var CommonViews = require('js/common/views');
              var msg_view = new CommonViews.FlashMessageView({ model: flash_message_model });
              access_view.region_message.show(msg_view);
            });
          }
        });
      }
      else {
        logger.debug('private.proc_local_login -- user form validation failed: ' + JSON.stringify(val_errs));
        access_view.trigger('access_form:show_val_errs', val_errs);
      }
    }

    /**
     * Process a local signup request, validating it and synchronising to the DB
     * @param  {Object} form_data           An object with a key for each form data field
     * @param  {Object} access_view         The layout view (whose access_form in region_main should show val errors)
     * @param  {String} trigger_after_login The navigation event that should be triggered after successful login
     */
    function proc_local_signup(form_data, access_view, trigger_after_login) {
      var uls = new AppObj.UserApp.Entities.UserLocalSignup({
        local_email: form_data.local_email,
        local_email_check: form_data.local_email_check,
        local_password: form_data.local_password,
        local_password_check: form_data.local_password_check
      });
      var val_errs = uls.validate(uls.attributes);
      if(_.isEmpty(val_errs)) {
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
            q(AppObj.request('common:entities:flashmessage'))
            .then(function(flash_message_model) {
              var CommonViews = require('js/common/views');
              var msg_view = new CommonViews.FlashMessageView({ model: flash_message_model });
              access_view.region_message.show(msg_view);
            });
          }
          else {
            logger.error('private.proc_local_signup - /api/user/access/local/signup response -- ' +
              'unknown status: ' + resp_data.status + ' (message: ' + resp_data.message + ')');
            q(AppObj.request('common:entities:flashmessage'))
            .then(function(flash_message_model) {
              var CommonViews = require('js/common/views');
              var msg_view = new CommonViews.FlashMessageView({ model: flash_message_model });
              access_view.region_message.show(msg_view);
            });
          }
        });
      }
      else {
        logger.debug('private.proc_local_signup -- user form validation failed: ' + JSON.stringify(val_errs));
        access_view.trigger('signup_form:show_val_errs', val_errs);
      }
    }

    Access.controller = {
      /**
       * Display the access form, allowing users to sign up and login
       * @param  {String} trigger_after_login The navigation event that should be triggered after successful login
       */
      show_access_form: function show_access_form(trigger_after_login) {
        logger.trace('show_access_form -- trigger_after_login: ' + trigger_after_login);
        if(!trigger_after_login) { trigger_after_login = 'user:profile'; }
        q(AppObj.request('common:entities:flashmessage'))
        .then(function(flash_message_model) {
          var AccessViews = require('js/apps/user/access/views');
          var CommonViews = require('js/common/views');
          var access_view = new AccessViews.AccessLayout();
          var msg_view = new CommonViews.FlashMessageView({ model: flash_message_model });
          var header_view = new CommonViews.H1Header({ model: new AppObj.Entities.ClientModel({
            header_text: 'Sign in'
          })});
          var access_form = new AccessViews.AccessForm({ model: new AppObj.Entities.ClientModel({
            fb_url: get_fb_auth_url(),
            google_url: get_google_auth_url(),
            twitter_url: get_twitter_auth_url(),
          })});
          access_form.on('home-clicked', function() { AppObj.trigger('home:show'); });
          access_form.on('fb-access-clicked', proc_fb_login);
          access_form.on('google-access-clicked', proc_google_login);
          access_form.on('twitter-access-clicked', proc_twitter_login);
          access_form.on('local-access-submitted', function(form_data) {
            proc_local_access_submitted(form_data, access_view, trigger_after_login);
          });
          access_view.on('access_form:show_val_errs', function(val_errs) {
            access_form.show_val_errs.call(access_form, val_errs);
          });
          access_view.on('render', function() {
            access_view.region_header.show(header_view);
            access_view.region_message.show(msg_view);
            access_view.region_form.show(access_form);
          });
          AppObj.region_main.show(access_view);
        });
      }
    };
  });

  return AppObj.UserApp.Access.controller;
});
