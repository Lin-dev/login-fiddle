define(function(require) {
  'use strict';

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
        case 'server_error': return 'Server error';
        case 'email_inuse': return 'Email address already used in another profile';
        case 'email_connected': return 'Email address connected';
        case 'fb_declined': return 'Facebook login cancelled';
        case 'fb_inuse': return 'Facebook account already connected to another profile';
        case 'fb_connected': return 'Facebook account connected';
        case 'twitter_declined': return 'Twitter login cancelled';
        case 'twitter_inuse': return 'Twitter account already connected to another profile';
        case 'twitter_connected': return 'Twitter account connected';
        case 'google_declined': return 'Google login cancelled';
        case 'google_inuse': return 'Google account already connected to another profile';
        case 'google_connected': return 'Google account connected';
        default:
          logger.error('private.get_message_from_code -- unknown code: ' + parsed_query.message_code);
          return 'Unknown code: ' + parsed_query.message_code;
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
     * Returns the string to set the client browser location to, to request account connect from Facebook. Is the
     * server API endpoint, which in turn generates and redirects to Facebook
     */
    function get_facebook_connect_url() {
      return AppObj.config.apps.user.facebook_connect_url + '?display=' +
        get_facebook_google_display_mode_from_ui_scale(Marionette.get_ui_scale());
    }

    /**
     * Returns the string to set the client browser location to, to request account connect from Google. Is the
     * server API endpoint, which in turn generates and redirects to Google
     */
    function get_google_connect_url() {
      return AppObj.config.apps.user.google_connect_url + '?display=' +
        get_facebook_google_display_mode_from_ui_scale(Marionette.get_ui_scale());
    }

    /**
     * Returns the string to set the client browser location to, to request account connect from Twitter. Is the
     * server API endpoint, which in turn generates and redirects to Twitter
     */
    function get_twitter_connect_url() {
      return AppObj.config.apps.user.twitter_connect_url;
    }

    /**
     * Connect user account to facebook account
     */
    function proc_connect_facebook() {
      window.location.href = get_facebook_connect_url();
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
          var up_promise = AppObj.request('userapp:entities:userprofile');
          up_promise.then(function(up) {
            logger.debug('AppObj.UserApp.Profile.contoller.show_user_profile -- showing: ' + JSON.stringify(up));
            up.set('message', get_message_from_code(query_string));
            // TODO - up.set('email_connect_url', ...);
            up.set('connect_facebook_url', get_facebook_connect_url());
            up.set('connect_google_url', get_google_connect_url());
            up.set('connect_twitter_url', get_twitter_connect_url());
            var Views = require('js/apps/user/profile/views');
            var view = new Views.UserProfile({ model: up });
            view.on('logout-clicked', proc_logout);
            view.on('email-connect-clicked', proc_connect_email);
            view.on('facebook-connect-clicked', proc_connect_facebook);
            view.on('google-connect-clicked', proc_connect_google);
            view.on('twitter-connect-clicked', proc_connect_twitter);
            AppObj.region_main.show(view);
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
