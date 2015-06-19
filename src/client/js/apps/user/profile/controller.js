define(function(require) {
  'use strict';

  var q = require('q');

  var AppObj = require('js/app/obj');
  var logger = AppObj.logger.get('root/js/apps/user/profile/controller');

  AppObj.module('UserApp.Profile', function(Profile, AppObj, Backbone, Marionette, $, _) {
    /**
     * Returns a user-displayable explanation of why the profile connect failed (e.g. refused permission at provider or
     * account at provider is already connected to another account on this site)
     * TODO - this method almost duplicated in client/js/apps/user/access/controller.js and .../profile/controller.js
     * @param  {String} query_string The query string code included in the URL query string the server redirects to
     * @return {String}              A user-displayable explanation of why the connect failed
     */
    function get_message_from_code(query_string) {
      var parsed_query = Marionette.parse_query_string(query_string);
      switch(parsed_query && parsed_query.message_code) {
        case undefined: return undefined;
        case 'fb_declined': return 'Facebook login cancelled';
        case 'twitter_declined': return 'Twitter login cancelled';
        case 'google_declined': return 'Google login cancelled';
        default:
          logger.error('private.get_message_from_code -- unknown code: ' + parsed_query.message_code);
          return 'Unknown code: ' + parsed_query.message_code;
      }
    }

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
     * Connect user account to their separate email account
     */
    function proc_connect_email() {
      logger.error('NYI');
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
          logger.debug('private.proc_disc_fb - server response -- success, re-rendering profile');
          AppObj.trigger('user:profile');
        }
        else {
          logger.error('private.proc_disc_fb - server response -- unknown status: ' + resp_data.status +
            ' (message: ' + resp_data.message + ')');
          AppObj.trigger('user:profile');
        }
      });
    }

    /**
     * Disconnect Google account from user account
     */
    function proc_disc_google(profile_view) {
      $.post(AppObj.config.apps.user.google_disconnect_url, {}, function(resp_data, textStatus, jqXhr) {
        if(resp_data.status === 'success') {
          logger.debug('private.proc_disc_google - server response -- success, re-rendering profile');
          AppObj.trigger('user:profile');
        }
        else if(resp_data.status === 'failure') {
          logger.debug('private.proc_disc_google - server response -- success, re-rendering profile');
          AppObj.trigger('user:profile');
        }
        else {
          logger.error('private.proc_disc_google - server response -- unknown status: ' + resp_data.status +
            ' (message: ' + resp_data.message + ')');
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
          logger.debug('private.proc_disc_twitter - server response -- success, re-rendering profile');
          AppObj.trigger('user:profile');
        }
        else {
          logger.error('private.proc_disc_twitter - server response -- unknown status: ' + resp_data.status +
            ' (message: ' + resp_data.message + ')');
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
       * @param  {String} query_string        Used so the server can send a message code to trigger a message display
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

            if(query_string) {
              var new_msg_str = get_message_from_code(query_string);
              logger.debug('show_user_profile -- received flash message: ' + msg + ', override to: ' + new_msg_str);
              msg.set('flash_message', new_msg_str);
            }
            up_admin.set('email_connected', up_data.is_email_connected());
            up_admin.set('fb_connected', up_data.is_fb_connected());
            up_admin.set('google_connected', up_data.is_google_connected());
            up_admin.set('twitter_connected', up_data.is_twitter_connected());
            logger.debug('show_user_profile -- up_data data: ' + JSON.stringify(up_data));
            logger.debug('show_user_profile -- up_admin data: ' + JSON.stringify(up_admin));
            logger.debug('show_user_profile -- msg data: ' + JSON.stringify(msg));

            var CommonViews = require('js/common/views');
            var ProfileViews = require('js/apps/user/profile/views');
            var msg_view = new CommonViews.FlashMessageView({ model: msg });
            var profile_view = new ProfileViews.UserProfileLayout();
            var p_data_view = new ProfileViews.UserProfileData({ model: up_data });
            var p_admin_view = new ProfileViews.UserProfileAdmin({ model: up_admin });
            p_admin_view.on('logout-clicked', proc_logout);
            p_admin_view.on('email-connect-clicked', proc_connect_email);
            p_admin_view.on('fb-connect-clicked', proc_connect_fb);
            p_admin_view.on('google-connect-clicked', proc_connect_google);
            p_admin_view.on('twitter-connect-clicked', proc_connect_twitter);
            p_admin_view.on('fb-disconnect-clicked', proc_disc_fb);
            p_admin_view.on('google-disconnect-clicked', proc_disc_google);
            p_admin_view.on('twitter-disconnect-clicked', proc_disc_twitter);
            profile_view.on('render', function() {
              profile_view.region_message.show(msg_view);
              profile_view.region_profile_data.show(p_data_view);
              profile_view.region_profile_admin.show(p_admin_view);
            });
            AppObj.region_main.show(profile_view);
          })
          .fail(function(err) {
            logger.error('show_user_profile -- error in resolving promises: ' + err);
          });
        }
        else {
          AppObj.trigger('user:access', 'user:profile');
        }
      }
    };
  });

  return AppObj.UserApp.Profile.controller;
});
