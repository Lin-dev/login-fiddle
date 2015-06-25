'use strict';

var _ = require('underscore');
var q = require('q');

var auth = require('app/util/auth');
var api_util_config = require('app/config/api_util');
var user_config = require('app/config/user');
var server_config = require('app/config/server');
var logger_module = require('app/util/logger');
var logger = logger_module.get('app/api/user/router_impl');

//var keys_required_for_login = [user_config.local.username_field, user_config.local.password_field];
var keys_required_for_login = [user_config.local.username_field, user_config.local.password_field];
var keys_required_for_signup = keys_required_for_login.concat(
  _.map(keys_required_for_login, function(field) { return field + '_check'; })
);

module.exports = {
  /**
   * Returns user description - assumes that the requester must be logged in to access this API endpoint
   */
  get_user: function get_user(pr, req, res, next) {
    var result = {
      local_email: req.user.local_email,
      signup_date: req.user.sq_created_at,
      fb_id: req.user.fb_id,
      fb_email: req.user.fb_email,
      fb_name: req.user.fb_name,
      twitter_id: req.user.twitter_id,
      twitter_username: req.user.twitter_username,
      twitter_name: req.user.twitter_name,
      google_name: req.user.google_name,
      google_email: req.user.google_email,
      google_id: req.user.google_id
    };
    res.status(200).send(result);
  },

  /**
   * Logs user out and destroys session (the logic for this: if they're logging out then in user's mind this session
   * is over)
   */
  logout: function logout(req, res, next) {
    req.logout();
    res.clearCookie(user_config.logged_in_cookie_name);
    req.session.destroy(function() {
      // No flash msg because we just destroyed the session: req.flash(api_util_config.flash_message_key, 'Logged out');
      // TODO: Can we create a new session immediately? No reason why not...
      res.redirect(server_config.util_route_success);
    });
  },

  /**
   * Initiates requests for Google authentication, using passport to redirect to Google - this API endpoint should
   * be access directly by the browser, not via AJAX
   * @type {Function}
   */
  access_google_auth: function access_google_auth(req, res, next) {
    logger.debug('exports.access_google_auth -- redir request to Google (display mode: ' + req.query.diplay + ')');
    (auth.passport.authenticate('google-access', {
      scope: user_config.google.scope,
      display: req.query.display
    }))(req, res, next);
  },

  /**
   * Completes requests for Google authentication for account signup
   * @type {Function}
   */
  access_google_callback: auth.passport.authenticate('google-access', {
    successRedirect: '/profile',
    failureRedirect: '/access',
    failureFlash: { type: api_util_config.flash_message_key, message: 'Login cancelled on Google' }
  }),

  /**
   * Initiates request for Google authorization, to connect accounts, using passport to redirect to Google - this
   * API endpoint should be accessed directly by the browser, not via AJAX
   * @type {Function}
   */
  connect_google_auth: function connect_google_auth(req, res, next) {
    (auth.passport.authorize('google-connect', {
      scope: user_config.google.scope,
      display: req.query.display
    }))(req, res, next);
  },

  /**
   * Completes request for google authentication for account connection, on success passes control to next middleware
   * @type {Function}
   */
  connect_google_callback: auth.passport.authorize('google-connect', {
    failureRedirect: '/profile',
    failureFlash: { type: api_util_config.flash_message_key, message: 'Login cancelled on Google' }
  }),

  /**
   * Disconnects user account from google, removing google-sourced fields from profile but does not deauth at Google
   */
  connect_google_disconnect: function connect_google_disconnect(req, res, next) {
    q(req.user.disconnect_google_and_save())
    .then(function(updated_user) {
      req.flash(api_util_config.flash_message_key, 'Google disconnected');
      res.redirect(server_config.util_route_success);
    })
    .fail(function(err) {
      logger.error('exports.connect_google_disconnect -- error during disconnect: ' + err);
      req.flash(api_util_config.flash_message_key, 'Error disconnecting Google');
      res.redirect(server_config.util_route_failure);
    });
  },

  /**
   * Initiates requests for Facebook authentication, using passport to redirect to Facebook - this API endpoint should
   * be access directly by the browser, not via AJAX
   * @type {Function}
   */
  access_fb_auth: function access_fb_auth(req, res, next) {
    logger.debug('exports.access_fb_auth -- redir request to FB (display mode: ' + req.query.display + ')');
    (auth.passport.authenticate('fb-access', {
      scope: user_config.fb.scope,
      display: req.query.display
    }))(req, res, next);
  },

  /**
   * Completes requests for Facebook authentication for account signup
   * @type {Function}
   */
  access_fb_callback: auth.passport.authenticate('fb-access', {
    successRedirect: '/profile',
    failureRedirect: '/access',
    failureFlash: { type: api_util_config.flash_message_key, message: 'Login cancelled on Facebook' }
  }),

  /**
   * Initiates request for Facebook authorization, to connect accounts, using passport to redirect to Facebook - this
   * API endpoint should be accessed directly by the browser, not via AJAX
   * @type {Function}
   */
  connect_fb_auth: function connect_fb_auth(req, res, next) {
    (auth.passport.authorize('fb-connect', {
      scope: user_config.fb.scope,
      display: req.query.display
    }))(req, res, next);
  },

  /**
   * Completes request for fb authentication for account connection, on success passes control to next middleware
   * @type {Function}
   */
  connect_fb_callback: auth.passport.authorize('fb-connect', {
    failureRedirect: '/profile',
    failureFlash: { type: api_util_config.flash_message_key, message: 'Login cancelled on Facebook' }
  }),

  /**
   * Disconnects user account from fb, removing fb-sourced fields from profile but does not deauth at FB
   */
  connect_fb_disconnect: function connect_fb_disconnect(req, res, next) {
    q(req.user.disconnect_fb_and_save())
    .then(function(updated_user) {
      req.flash(api_util_config.flash_message_key, 'Facebook disconnected');
      res.redirect(server_config.util_route_success);
    })
    .fail(function(err) {
      logger.error('exports.connect_fb_disconnect -- error during disconnect: ' + err);
      req.flash(api_util_config.flash_message_key, 'Error disconnecting Facebook');
      res.redirect(server_config.util_route_failure);
    });
  },

  /**
   * Passport.js redirects without explanation on failure, this middleware should be run first to check that the
   * fields expected by the authentication strategy for local login are present - log if not
   */
  access_local_check_login_post: auth.mw_gen.check_post_has_req_fields(keys_required_for_login),

  /**
   * Passport.js redirects without explanation on failure, this middleware should be run first to check that the
   * fields expected by the authentication strategy for local signup are present - log if not
   */
  access_local_check_login_signup: auth.mw_gen.check_post_has_req_fields(keys_required_for_signup),

  /**
   * Handles requests for local access account login
   * @type {Function}
   */
  access_local_login: auth.passport.authenticate('local-login', {
    successRedirect: server_config.util_route_success,
    failureRedirect: server_config.util_route_failure,
    failureFlash: true
  }),

  /**
   * Handles requests for local access account signup
   * @type {Function}
   */
  access_local_signup: auth.passport.authenticate('local-signup', {
    successRedirect: server_config.util_route_success,
    failureRedirect: server_config.util_route_failure,
    failureFlash: true
  }),

  /**
   * Initiates requests for Twitter authentication, using passport to redirect to Twitter - this API endpoint should
   * be access directly by the browser, not via AJAX
   * @type {Function}
   */
  access_twitter_auth: auth.passport.authenticate('twitter-access'),

  /**
   * Completes request for Twitter authentication for account signup
   * @type {Function}
   */
  access_twitter_callback: auth.passport.authenticate('twitter-access', {
    successRedirect: '/profile',
    failureRedirect: '/access',
    failureFlash:  { type: api_util_config.flash_message_key, message: 'Login cancelled on Twitter' }
  }),

  /**
   * Initiates request for Twitter authorization, to connect accounts, using passport to redirect to Twitter - this
   * API endpoint should be accessed directly by the browser, not via AJAX
   * @type {Function}
   */
  connect_twitter_auth: auth.passport.authorize('twitter-connect'),

  /**
   * Completes request for Twitter authentication for account connection, on success passes control to next middleware
   * @type {Function}
   */
  connect_twitter_callback: auth.passport.authorize('twitter-connect', {
    failureRedirect: '/profile',
    failureFlash: { type: api_util_config.flash_message_key, message: 'Login cancelled on Twitter' }
  }),

  /**
   * Disconnects user account from twitter, removing twitter-sourced fields from profile but does not deauth at Twitter
   */
  connect_twitter_disconnect: function connect_twitter_disconnect(req, res, next) {
    q(req.user.disconnect_twitter_and_save())
    .then(function(updated_user) {
      req.flash(api_util_config.flash_message_key, 'Twitter disconnected');
      res.redirect(server_config.util_route_success);
    })
    .fail(function(err) {
      logger.error('exports.connect_twitter_disconnect -- error during disconnect: ' + err);
      req.flash(api_util_config.flash_message_key, 'Error disconnecting Twitter');
      res.redirect(server_config.util_route_failure);
    });
  }
};
