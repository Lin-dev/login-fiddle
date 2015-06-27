define(function(require) {
  'use strict';

  var q = require('q');

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/user/profile/controller');

  AppObj.module('UserApp.Profile', function(Profile, AppObj, Backbone, Marionette, $, _) {
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
     * Returns the string to set the client browser location to, to request account connect from Facebook. Is the
     * server API endpoint, which in turn generates and redirects to Facebook
     */
    function get_fb_connect_url() {
      return AppObj.config.apps.user.fb_connect_url + '?display=' +
        get_fb_google_display_mode_from_ui_scale(Marionette.get_ui_scale());
    }

    /**
     * Returns the string to set the client browser location to, to request account connect from Google. Is the
     * server API endpoint, which in turn generates and redirects to Google
     */
    function get_google_connect_url() {
      return AppObj.config.apps.user.google_connect_url + '?display=' +
        get_fb_google_display_mode_from_ui_scale(Marionette.get_ui_scale());
    }

    /**
     * Returns the string to set the client browser location to, to request account connect from Twitter. Is the
     * server API endpoint, which in turn generates and redirects to Twitter
     */
    function get_twitter_connect_url() {
      return AppObj.config.apps.user.twitter_connect_url;
    }

    /**
     * Connect user account to fb account
     */
    function proc_connect_fb() {
      window.location.href = get_fb_connect_url();
    }

    /**
     * Connect user account to google account
     */
    function proc_connect_google() {
      window.location.href = get_google_connect_url();
    }

    /**
     * Connect user account to twitter account
     */
    function proc_connect_twitter() {
      window.location.href = get_twitter_connect_url();
    }

    /**
     * Disconnect Facebook account from user account
     */
    function proc_disc_fb() {
      $.post(AppObj.config.apps.user.fb_disconnect_url, {}, function(resp_data, textStatus, jqXhr) {
        if(resp_data.status === 'success') {
          logger.debug('private.proc_disc_fb - server response -- success, re-rendering profile');
          AppObj.trigger('user:profile');
        }
        else if(resp_data.status === 'failure') {
          logger.debug('private.proc_disc_fb - server response -- failure, re-rendering profile');
          AppObj.trigger('user:profile');
        }
        else {
          logger.error('private.proc_disc_fb - server response -- unknown status: ' + resp_data.status);
          AppObj.trigger('user:profile');
        }
      });
    }

    /**
     * Disconnect Google account from user account
     */
    function proc_disc_google() {
      $.post(AppObj.config.apps.user.google_disconnect_url, {}, function(resp_data, textStatus, jqXhr) {
        if(resp_data.status === 'success') {
          logger.debug('private.proc_disc_google - server response -- success, re-rendering profile');
          AppObj.trigger('user:profile');
        }
        else if(resp_data.status === 'failure') {
          logger.debug('private.proc_disc_google - server response -- failure, re-rendering profile');
          AppObj.trigger('user:profile');
        }
        else {
          logger.error('private.proc_disc_google - server response -- unknown status: ' + resp_data.status);
          AppObj.trigger('user:profile');
        }
      });
    }

    /**
     * Disconnect Twitter account from user account
     */
    function proc_disc_twitter() {
      $.post(AppObj.config.apps.user.twitter_disconnect_url, {}, function(resp_data, textStatus, jqXhr) {
        if(resp_data.status === 'success') {
          logger.debug('private.proc_disc_twitter - server response -- success, re-rendering profile');
          AppObj.trigger('user:profile');
        }
        else if(resp_data.status === 'failure') {
          logger.debug('private.proc_disc_twitter - server response -- failure, re-rendering profile');
          AppObj.trigger('user:profile');
        }
        else {
          logger.error('private.proc_disc_twitter - server response -- unknown status: ' + resp_data.status);
          AppObj.trigger('user:profile');
        }
      });
    }

    /**
     * Display form to connect user account to their separate email account
     * @param {Object} profile_view The profile layout view in which the profile component subviews are rendered
     */
    function proc_connect_local(profile_view) {
      var CommonViews = require('js/common/views');
      var ProfileViews = require('js/apps/user/profile/views');
      var header_view = new CommonViews.H1Header({ model: new AppObj.Entities.ClientModel({
        header_text: 'Add email'
      })});
      var connect_form_view = new ProfileViews.LocalConnectForm({
        model: new AppObj.UserApp.Entities.UserLocalConnect()
      });
      connect_form_view.on('profile-clicked', function() { AppObj.trigger('user:profile'); });
      connect_form_view.on('local-connect-submitted', function(form_data) {
        proc_connect_local_submitted(form_data, profile_view);
      });
      profile_view.on('connect_form:show_val_errs', function(val_errs) {
        connect_form_view.show_val_errs.call(connect_form_view, val_errs);
      });
      profile_view.region_header.show(header_view);
      profile_view.region_message.empty(); // clear any flash message already shown when displaying local connect view
      profile_view.region_profile_data.show(connect_form_view);
      profile_view.region_profile_admin.empty();
    }

    /**
     * Process form submission to connect user to their separate email account
     * @param {Object} form_data    The submitted form data serialised as an object using syphon
     * @param {Object} profile_view The profile layout view in which the profile component subviews are rendered
     */
    function proc_connect_local_submitted(form_data, profile_view) {
      require('js/apps/user/entities');
      // UserLocalConnect just for validation (passport redirect mucks up Backbone model sync)
      var ulc = new AppObj.UserApp.Entities.UserLocalConnect({
        local_email: form_data.local_email,
        local_email_check: form_data.local_email_check,
        local_password: form_data.local_password,
        local_password_check: form_data.local_password_check
      });
      var val_errs = ulc.validate(ulc.attributes);
      if(_.isEmpty(val_errs)) {
        logger.debug('private.proc_connect_local_submitted -- form validatin passed: ' + JSON.stringify(form_data));
        $.post(AppObj.config.apps.user.local_connect_path, form_data, function(resp_data, textStatus, jqXhr) {
          if(resp_data.status === 'success') {
            logger.debug('private.proc_connect_local_submitted - server API call response -- success');
            AppObj.trigger('user:profile'); // cleaner than manually updating profile data and displaying flash message
          }
          else if(resp_data.status === 'failure') {
            q(AppObj.request('common:entities:flashmessage'))
            .then(function(flash_message_model) {
              logger.debug('private.proc_local_signup - server API call response -- connect failure: ' +
                flash_message_model);
              var CommonViews = require('js/common/views');
              var msg_view = new CommonViews.FlashMessageView({ model: flash_message_model });
              profile_view.region_message.show(msg_view);
            })
            .fail(AppObj.on_promise_fail_gen('UserApp.Profile - private.proc_connect_local_submitted'));
          }
          else {
            logger.error('private.proc_connect_local_submitted - server API call response -- ' +
              'unknown status: ' + resp_data.status);
            AppObj.trigger('user:profile'); // cleaner than manually updating profile data and displaying flash message
          }
        });
      }
      else {
        logger.debug('private.proc_connect_local_submitted -- form validation failed: ' + JSON.stringify(val_errs));
        profile_view.trigger('connect_form:show_val_errs', val_errs);
      }
    }

    /**
     * Disconnect email address from user account
     */
    function proc_disc_local() {
      $.post(AppObj.config.apps.user.local_disconnect_path, {}, function(resp_data, textStatus, jqXhr) {
        if(resp_data.status === 'success') {
          logger.debug('private.proc_disc_local - server response -- success, re-rendering profile');
          AppObj.trigger('user:profile');
        }
        else if(resp_data.status === 'failure') {
          logger.debug('private.proc_disc_local - server response -- failure, re-rendering profile');
          AppObj.trigger('user:profile');
        }
        else {
          logger.error('private.proc_disc_loal - server response -- unknown status: ' + resp_data.status);
          AppObj.trigger('user:profile');
        }
      });
    }

    /**
     * Log out logged in user, redirect to home:show
     */
    function proc_logout() {
      logger.trace('proc_logout');
      $.get('/api/user/logout', function(resp_data, textStatus, jqXhr) {
        AppObj.trigger('home:show');
      });
    }

    Profile.controller = {
      /**
       * Display the user profile, allowing users to connect other providers and logout
       * @param {String} query_string        Used so the server can send a message code to trigger a message display
       */
      show_user_profile: function show_user_profile(query_string) {
        logger.trace('show_user_profile -- query_string: ' + query_string);
        if(AppObj.is_logged_in()) {
          var upd_promise = AppObj.request('userapp:entities:userprofiledata');
          var upa_promise = AppObj.request('userapp:entities:userprofileadmin');
          var msg_promise = AppObj.request('common:entities:flashmessage');
          q.all([upd_promise, upa_promise, msg_promise])
          .spread(function(up_data, up_admin, msg) {
            require('js/apps/user/entities');
            require('js/common/entities');

            logger.debug('show_user_profile -- msg data: ' + JSON.stringify(msg));
            logger.debug('show_user_profile -- up_data data: ' + JSON.stringify(up_data));
            logger.debug('show_user_profile -- up_admin data: ' + JSON.stringify(up_admin));

            up_admin.set('email_connected', up_data.is_email_connected());
            up_admin.set('fb_connected', up_data.is_fb_connected());
            up_admin.set('google_connected', up_data.is_google_connected());
            up_admin.set('twitter_connected', up_data.is_twitter_connected());

            var CommonViews = require('js/common/views');
            var ProfileViews = require('js/apps/user/profile/views');
            var profile_view = new ProfileViews.UserProfileLayout();
            var header_view = new CommonViews.H1Header({ model: new AppObj.Entities.ClientModel({
              header_text: 'User profile'
            })});
            var msg_view = new CommonViews.FlashMessageView({ model: msg });
            var p_data_view = new ProfileViews.UserProfileData({ model: up_data });
            var p_admin_view = new ProfileViews.UserProfileAdmin({ model: up_admin });
            p_admin_view.on('logout-clicked', proc_logout);
            p_admin_view.on('local-connect-clicked', function() { proc_connect_local(profile_view); });
            p_admin_view.on('fb-connect-clicked', proc_connect_fb);
            p_admin_view.on('google-connect-clicked', proc_connect_google);
            p_admin_view.on('twitter-connect-clicked', proc_connect_twitter);
            p_admin_view.on('local-disconnect-clicked', proc_disc_local);
            p_admin_view.on('fb-disconnect-clicked', proc_disc_fb);
            p_admin_view.on('google-disconnect-clicked', proc_disc_google);
            p_admin_view.on('twitter-disconnect-clicked', proc_disc_twitter);
            profile_view.on('render', function() {
              profile_view.region_header.show(header_view);
              profile_view.region_message.show(msg_view);
              profile_view.region_profile_data.show(p_data_view);
              profile_view.region_profile_admin.show(p_admin_view);
            });
            AppObj.region_main.show(profile_view);
          })
          .fail(AppObj.on_promise_fail_gen('UserApp.Profile.controller.show_user_profile'));
        }
        else {
          AppObj.trigger('user:access', 'user:profile');
        }
      }
    };
  });

  return AppObj.UserApp.Profile.controller;
});
