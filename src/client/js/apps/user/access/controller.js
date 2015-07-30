define(function(require) {
  'use strict';

  var q = require('q');

  var AppObj = require('js/app/obj');
  var Display = require('js/display/obj');
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
     * Returns the string to set the client browser location to, to request auth from FB. Is the
     * server API endpoint, which in turn generates and redirects to FB. If successful the user is
     * reactivated.
     */
    function get_fb_reactivate_url() {
      return AppObj.config.apps.user.fb_reactivate_url + '?display=' +
        get_fb_google_display_mode_from_ui_scale(Marionette.get_ui_scale());
    }

    /**
     * Returns the string to set the client browser location to, to request auth from Google. Is the
     * server API endpoint, which in turn generates and redirects to Google. If successful the user is
     * reactivated.
     */
    function get_google_reactivate_url() {
      return AppObj.config.apps.user.google_reactivate_url + '?display=' +
        get_fb_google_display_mode_from_ui_scale(Marionette.get_ui_scale());
    }

    /**
     * Returns the string to set the client browser location to, to request auth from Twitter. Is the
     * server API endpoint, which in turn generates and redirects to Twitter. If successful the user is
     * reactivated.
     */
    function get_twitter_reactivate_url() {
      return AppObj.config.apps.user.twitter_reactivate_url;
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
     * Process a FB login request - redirect the client browser to the fb auth request URL. If the user
     * account is deactivated then reactivate it on successful login.
     */
    function proc_fb_reactivate() {
      logger.trace('private.proc_fb_reactivate -- redirecting to fb');
      window.location.href = get_fb_reactivate_url();
    }

    /**
     * Process a Google login request - redirect the client browser to the Google auth request URL. If the user
     * account is deactivated then reactivate it on successful login.
     */
    function proc_google_reactivate() {
      logger.trace('private.proc_fb_reactivate -- redirecting to Google');
      window.location.href = get_google_reactivate_url();
    }

    /**
     * Process a twitter login request - redirect the client browser to the twitter auth request URL. If the user
     * account is deactivated then reactivate it on successful login.
     */
    function proc_twitter_reactivate() {
      logger.trace('private.proc_twitter_reactivate -- redirecting to twitter');
      window.location.href = get_twitter_reactivate_url();
    }

    /**
     * Respond to the local access form submission (either for signup or login)
     * @param  {Object} form_data            The submitted form data serialised as an object using syphon
     * @param  {Object} access_view          The instance of AccessViews.AccessLayout that is rendered already
     * @param  {String} trigger_after_access The event trigger to fire after a succesful login
     */
    function proc_local_access_submitted(form_data, access_view, trigger_after_access) {
      if(form_data.has_pw_flag === 'true') { // then attempt a login using email / password
        proc_local_login(form_data, access_view, trigger_after_access);
      }
      else if(form_data.has_pw_flag === 'false') { // then show the signup form if pw flag is false and email valid
        require('js/apps/user/entities');
        var email_validation = new AppObj.UserApp.Entities.UserLocalAccess();
        var val_errs = email_validation.validate(form_data);
        if(_.isEmpty(val_errs)) {
          AppObj.trigger('user:access:signup', trigger_after_access, form_data.local_email);
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
     * @param  {Object} form_data            An object with a key for each form data field
     * @param  {Object} access_view          The layout view (whose access_form in region_main should show val errors)
     * @param  {String} trigger_after_access The event to trigger after successful login (default: user:profile)
     */
    function proc_local_login(form_data, access_view, trigger_after_access) {
      require('js/apps/user/entities');
      trigger_after_access = trigger_after_access || 'user:profile';
      // UserLocalAccess just for validation (passport redirect mucks up Backbone model sync)
      var ula = new AppObj.UserApp.Entities.UserLocalAccess({
        local_email: form_data.local_email.trim(),
        has_pw_flag: form_data.has_pw_flag,
        local_password: form_data.local_password
      });
      var val_errs = ula.validate(ula.attributes);
      if(_.isEmpty(val_errs)) {
        logger.debug('private.proc_local_login -- access form validation passed: ' + JSON.stringify(form_data));
        $.post(AppObj.config.apps.user.local_login_path, form_data, function(resp_data, textStatus, jqXhr) {
          if(resp_data.status === 'success') {
            logger.debug('private.proc_local_login - server API call response -- succeess, redirecting to: ' +
              trigger_after_access);
            AppObj.trigger(trigger_after_access);
          }
          else if(resp_data.status === 'failure') {
            logger.debug('private.proc_local_login - server API call response -- login failure');
            q(AppObj.request('common:entities:flashmessage'))
            .then(function(flash_message_model) {
              var CommonViews = require('js/common/views');
              var msg_view = new CommonViews.FlashMessageView({ model: flash_message_model });
              msg_view.on('action-link-clicked', function() {
                AppObj.trigger('user:access:reactivate', form_data.local_email);
              });
              access_view.region_message.show(msg_view);
              AppObj.scroll_to_top();
            })
            .fail(AppObj.on_promise_fail_gen('UserApp.Access - private.proc_local_login'));
          }
          else {
            q(AppObj.request('common:entities:flashmessage'))
            .then(function(flash_message_model) {
              logger.error('private.proc_local_signup - server API call response -- unknown status: ' +
                resp_data.status + ' (flash message: ' + flash_message_model + ')');
              var CommonViews = require('js/common/views');
              var msg_view = new CommonViews.FlashMessageView({ model: flash_message_model });
              access_view.region_message.show(msg_view);
              AppObj.scroll_to_top();
            })
            .fail(AppObj.on_promise_fail_gen('UserApp.Access - private.proc_local_signup'));
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
     * @param  {Object} form_data            An object with a key for each submitted form data field
     * @param  {Object} access_view          The layout view (whose access_form in region_main should show val errors)
     * @param  {String} trigger_after_access The event to trigger after successful signup (default: user:profile)
     */
    function proc_local_signup(form_data, access_view, trigger_after_access) {
      require('js/apps/user/entities');
      trigger_after_access = trigger_after_access || 'user:profile';
      // UserLocalSignup just for validation (passport redirect mucks up Backbone model sync)
      var uls = new AppObj.UserApp.Entities.UserLocalSignup({
        local_email: form_data.local_email.trim(),
        local_email_check: form_data.local_email_check.trim(),
        local_password: form_data.local_password,
        local_password_check: form_data.local_password_check
      });
      var val_errs = uls.validate(uls.attributes);
      if(_.isEmpty(val_errs)) {
        logger.debug('private.proc_local_signup -- user form validation passed: ' + JSON.stringify(form_data));
        $.post(AppObj.config.apps.user.local_signup_path, form_data, function(resp_data, textStatus, jqXhr) {
          if(resp_data.status === 'success') {
            logger.debug('private.proc_local_signup - server API call response -- succeess, redirecting to: ' +
              trigger_after_access);
            AppObj.trigger(trigger_after_access);
          }
          else if(resp_data.status === 'failure') {
            q(AppObj.request('common:entities:flashmessage'))
            .then(function(flash_message_model) {
              logger.debug('private.proc_local_signup - server API call response -- ' +
                'signup failure: ' + flash_message_model);
              var CommonViews = require('js/common/views');
              var msg_view = new CommonViews.FlashMessageView({ model: flash_message_model });
              access_view.region_message.show(msg_view);
              AppObj.scroll_to_top();
            })
            .fail(AppObj.on_promise_fail_gen('UserApp.Access - private.proc_local_signup'));
          }
          else {
            q(AppObj.request('common:entities:flashmessage'))
            .then(function(flash_message_model) {
              logger.error('private.proc_local_signup - server API call response -- ' +
                'unknown status: ' + resp_data.status + ' (flash message: ' + flash_message_model + ')');
              var CommonViews = require('js/common/views');
              var msg_view = new CommonViews.FlashMessageView({ model: flash_message_model });
              access_view.region_message.show(msg_view);
              AppObj.scroll_to_top();
            })
            .fail(AppObj.on_promise_fail_gen('UserApp.Access - private.proc_local_signup'));
          }
        });
      }
      else {
        logger.debug('private.proc_local_signup -- user form validation failed: ' + JSON.stringify(val_errs));
        access_view.trigger('signup_form:show_val_errs', val_errs);
      }
    }

    /**
     * Respond to the local reactivation form submission
     * @param {Object} form_data                The submitted form data serialised as an object using syphon
     * @param {Object} access_view              The instance of AccessViews.AccessLayout that is rendered already
     * @param {String} trigger_after_reactivate The event to trigger after successful reactivation
     */
    function proc_local_reactivate_submitted(form_data, access_view, trigger_after_reactivate) {
      require('js/apps/user/entities');
      trigger_after_reactivate  = trigger_after_reactivate || 'user:profile';
      // UserLocalReactivate just for validation (passport redirect mucks up Backbone model sync)
      var ula = new AppObj.UserApp.Entities.UserLocalReactivate({
        local_email: form_data.local_email.trim(),
        local_password: form_data.local_password
      });
      var val_errs = ula.validate(ula.attributes);
      if(_.isEmpty(val_errs)) {
        logger.debug('private.proc_local_reactivate_submitted -- validation passed');
        proc_local_reactivate(form_data, access_view, trigger_after_reactivate);
      }
      else {
        logger.debug('private.proc_local_reactivate_submitted -- user form val failed: ' + JSON.stringify(val_errs));
        access_view.trigger('reactivate_form:show_val_errs', val_errs);
      }
    }

    /**
     * Posts a request to the server for user reactivation and log in using their local email and password.
     * @param {Object} form_data                The submitted form data serialised as an object using syphon
     * @param {Object} access_view              The instance of AccessViews.AccessLayout that is rendered already
     * @param {String} trigger_after_reactivate The application event to trigger after reactivation (successful or not)
     */
    function proc_local_reactivate(form_data, access_view, trigger_after_reactivate) {
      require('js/apps/user/entities');
      var ula = new AppObj.UserApp.Entities.UserLocalAccess({
        local_email: form_data.local_email,
        local_password: form_data.local_password
      });
      var val_errs = ula.validate(ula.attributes);
      if(_.isEmpty(val_errs)) {
        $.post(AppObj.config.apps.user.local_reactivate_path, form_data, function(resp_data, textStatus, jqXhr) {
          if(resp_data.status === 'success') {
            logger.debug('private.proc_local_reactivate - server API call response -- succeess, redirecting to: ' +
              trigger_after_reactivate);
            AppObj.trigger(trigger_after_reactivate);
          }
          else if(resp_data.status === 'failure') {
            q(AppObj.request('common:entities:flashmessage'))
            .then(function(flash_message_model) {
              logger.debug('private.proc_local_reactivate - server API call response -- ' +
                'signup failure: ' + flash_message_model);
              var CommonViews = require('js/common/views');
              var msg_view = new CommonViews.FlashMessageView({ model: flash_message_model });
              access_view.region_message.show(msg_view);
              AppObj.scroll_to_top();
            })
            .fail(AppObj.on_promise_fail_gen('UserApp.Access - private.proc_local_reactivate'));
          }
          else {
            q(AppObj.request('common:entities:flashmessage'))
            .then(function(flash_message_model) {
              logger.error('private.proc_local_reactivate - server API call response -- ' +
                'unknown status: ' + resp_data.status + ' (flash message: ' + flash_message_model + ')');
              var CommonViews = require('js/common/views');
              var msg_view = new CommonViews.FlashMessageView({ model: flash_message_model });
              access_view.region_message.show(msg_view);
              AppObj.scroll_to_top();
            })
            .fail(AppObj.on_promise_fail_gen('UserApp.Access - private.proc_local_reactivate'));
          }
        });
      }
      else {
        logger.debug('private.proc_local_reactivate -- user form validation failed: ' + JSON.stringify(val_errs));
        access_view.trigger('reactivate_form:show_val_errs', val_errs);
      }
    }

    Access.controller = {
      /**
       * Display the access form, allowing users to sign up and login
       * @param {String} trigger_after_access The navigation event that should be triggered after successful login
       */
      show_access_form: function show_access_form(trigger_after_access) {
        logger.trace('show_access_form -- trigger_after_access: ' + trigger_after_access);
        require('js/common/entities');
        if(!trigger_after_access) { trigger_after_access = 'user:profile'; }
        q(AppObj.request('common:entities:flashmessage'))
        .then(function(flash_message_model) {
          var AccessViews = require('js/apps/user/access/views');
          var CommonViews = require('js/common/views');
          var access_view = new AccessViews.AccessLayout();
          var msg_view = new CommonViews.FlashMessageView({ model: flash_message_model });
          // Needed here because attempts to log in to a deactivated account reload the access form
          msg_view.on('action-link-clicked', function() { AppObj.trigger('user:access:reactivate'); });
          var header_view = new CommonViews.H1Header({ model: new AppObj.Common.Entities.ClientModel({
            header_text: 'Sign in'
          })});
          var access_form = new AccessViews.AccessForm({ model: new AppObj.Common.Entities.ClientModel({
            fb_url: get_fb_auth_url(),
            google_url: get_google_auth_url(),
            twitter_url: get_twitter_auth_url(),
          })});
          access_form.on('home-clicked', function() { AppObj.trigger('home:show'); });
          access_form.on('fb-access-clicked', proc_fb_login);
          access_form.on('google-access-clicked', proc_google_login);
          access_form.on('twitter-access-clicked', proc_twitter_login);
          access_form.on('local-access-submitted', function(form_data) {
            proc_local_access_submitted(form_data, access_view, trigger_after_access);
          });
          access_view.on('access_form:show_val_errs', function(val_errs) {
            access_form.show_val_errs.call(access_form, val_errs);
          });
          access_view.on('render', function() {
            access_view.region_header.show(header_view);
            access_view.region_message.show(msg_view);
            access_view.region_form.show(access_form);
          });
          Display.tainer.show_in('main', access_view);
        })
        .fail(AppObj.on_promise_fail_gen('UserApp.Access.controller.show_access_form'));
      },

      /**
       * Display the access form, allowing users to sign up using an email and password
       * @param {String} trigger_after_access The navigation event that should be triggered after successful login
       * @param {String} email_address        Optional, an email address to pre-populate the first email field with
       */
      show_signup_form: function show_signup_form(trigger_after_signup, email_address) {
        logger.trace('show_signup_form -- trigger_after_signup: ' + trigger_after_signup + ', email: ' + email_address);
        require('js/common/entities');
        if(!trigger_after_signup) { trigger_after_signup = 'user:profile'; }
        q(AppObj.request('common:entities:flashmessage'))
        .then(function(flash_message_model) {
          require('js/apps/user/entities');
          var AccessViews = require('js/apps/user/access/views');
          var CommonViews = require('js/common/views');
          var access_view = new AccessViews.AccessLayout();
          var msg_view = new CommonViews.FlashMessageView({ model: flash_message_model });
          var header_view = new CommonViews.H1Header({ model: new AppObj.Common.Entities.ClientModel({
            header_text: 'Sign up'
          })});
          var signup_form = new AccessViews.SignupForm({
            model: new AppObj.UserApp.Entities.UserLocalSignup({ local_email: email_address })
          });
          signup_form.on('home-clicked', function() { AppObj.trigger('home:show'); });
          signup_form.on('login-clicked', function() { AppObj.trigger('user:access'); });
          signup_form.on('local-signup-submitted', function(form_data) {
            proc_local_signup(form_data, access_view, trigger_after_signup);
          });
          access_view.on('signup_form:show_val_errs', function(val_errs) {
            signup_form.show_val_errs.call(signup_form, val_errs);
          });
          access_view.on('render', function() {
            access_view.region_header.show(header_view);
            access_view.region_message.show(msg_view);
            access_view.region_form.show(signup_form);
          });
          Display.tainer.show_in('main', access_view);
        })
        .fail(AppObj.on_promise_fail_gen('UserApp.Access.controller.show_signup_form'));
      },

      /**
       * Displays the reactivation form, filled out with the deactivated user's email address if they just tried to
       * log in using their local email
       * @param {String} local_email The local email address of the account to reactivate (optional)
       */
      show_reactivate_form: function show_reactivate_form(local_email) {
        logger.trace('show_reactivate_form -- enter with local_email: ' + local_email);
        require('js/common/entities');
        q(AppObj.request('common:entities:flashmessage'))
        .then(function(flash_message_model) {
          require('js/apps/user/entities');
          var AccessViews = require('js/apps/user/access/views');
          var CommonViews = require('js/common/views');
          var access_layout = new AccessViews.AccessLayout();
          var msg_view = new CommonViews.FlashMessageView({ model: flash_message_model });
          var header_view = new CommonViews.H1Header({ model: new AppObj.Common.Entities.ClientModel({
            header_text: 'Reactivate and login'
          })});
          var reactivate_form = new AccessViews.ReactivateForm({ model: new AppObj.Common.Entities.ClientModel({
            fb_url: get_fb_reactivate_url(),
            google_url: get_google_reactivate_url(),
            twitter_url: get_twitter_reactivate_url(),
            local_email: local_email
          })});
          reactivate_form.on('home-clicked', function() { AppObj.trigger('home:show'); });
          reactivate_form.on('fb-access-clicked', proc_fb_reactivate);
          reactivate_form.on('google-access-clicked', proc_google_reactivate);
          reactivate_form.on('twitter-access-clicked', proc_twitter_reactivate);
          reactivate_form.on('local-reactivate-submitted', function(form_data) {
            proc_local_reactivate_submitted(form_data, access_layout, 'user:profile');
          });
          access_layout.on('reactivate_form:show_val_errs', function(val_errs) {
            reactivate_form.show_val_errs.call(reactivate_form, val_errs, 'user:profile');
          });
          access_layout.on('render', function() {
            access_layout.region_header.show(header_view);
            access_layout.region_message.show(msg_view);
            access_layout.region_form.show(reactivate_form);
          });
          Display.tainer.show_in('main', access_layout);
        })
        .fail(AppObj.on_promise_fail_gen('UserApp.Access.controller.show_reactivate_form'));
      }
    };
  });

  return AppObj.UserApp.Access.controller;
});
