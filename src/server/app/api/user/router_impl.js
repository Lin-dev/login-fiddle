'use strict';

var _ = require('underscore');
var q = require('q');

var auth = require('app/util/auth');
var user_config = require('app/config/user');
var server_config = require('app/config/server');
var logger_module = require('app/util/logger');
var logger = logger_module.get('app/api/session/router_impl');

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
      facebook_id: req.user.facebook_id,
      facebook_email: req.user.facebook_email,
      facebook_name: req.user.facebook_name,
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
      // No req.flash message because we just destroyed the session: req.flash('message', 'Logged out');
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
      scope: ['profile', 'email'],
      display: req.query.display
    }))(req, res, next);
  },

  /**
   * Completes requests for Google authentication for account signup
   * @type {Function}
   */
  access_google_callback: auth.passport.authenticate('google-access', {
    successRedirect: '/profile',
    failureRedirect: '/access?reason=google_declined',
    failureFlash: true
  }),

  /**
   * Initiates request for Google authorization, to connect accounts, using passport to redirect to Google - this
   * API endpoint should be accessed directly by the browser, not via AJAX
   * @type {Function}
   */
  connect_google_auth: auth.passport.authorize('google-connect'),

  /**
   * Completes request for google authentication for account connection
   * @type {Function}
   */
  connect_google_callback: auth.passport.authorize('google-connect', {
    successReturnToOrRedirect: 'strategy-callback-should-specify-redirectTo-in-all-cases',
    failureRedirect: '/profile?reason=google_declined',
    failureFlash: true
  }),

  /**
   * Disconnects user account from google, removing google-sourced fields from profile but does not deauth at Google
   */
  connect_google_disconnect: function connect_google_disconnect(req, res, next) {
    q(req.user.disconnect_google_and_save())
    .then(function(updated_user) {
      res.redirect(server_config.util_route_success);
    })
    .fail(function(error) {
      logger.error('exports.connect_google_disconnect -- error during disconnect: ' + error);
      res.redirect(server_config.util_route_failure);
    });
  },

  /**
   * Initiates requests for Facebook authentication, using passport to redirect to Facebook - this API endpoint should
   * be access directly by the browser, not via AJAX
   * @type {Function}
   */
  access_facebook_auth: function access_facebook_auth(req, res, next) {
    logger.debug('exports.access_facebook_auth -- redir request to FB (display mode: ' + req.query.display + ')');
    (auth.passport.authenticate('facebook-access', {
      scope: ['public_profile', 'email'],
      display: req.query.display
    }))(req, res, next);
  },

  /**
   * Completes requests for Facebook authentication for account signup
   * @type {Function}
   */
  access_facebook_callback: auth.passport.authenticate('facebook-access', {
    successRedirect: '/profile',
    failureRedirect: '/access?reason=fb_declined',
    failureFlash: true
  }),

  /**
   * Initiates request for Facebook authorization, to connect accounts, using passport to redirect to Facebook - this
   * API endpoint should be accessed directly by the browser, not via AJAX
   * @type {Function}
   */
  connect_facebook_auth: auth.passport.authorize('facebook-connect'),

  /**
   * Completes request for facebook authentication for account connection
   * @type {Function}
   */
  connect_facebook_callback: auth.passport.authorize('facebook-connect', {
    successReturnToOrRedirect: 'strategy-callback-should-specify-redirectTo-in-all-cases',
    failureRedirect: '/profile?reason=facebook_declined',
    failureFlash: true
  }),

  /**
   * Disconnects user account from facebook, removing facebook-sourced fields from profile but does not deauth at FB
   */
  connect_facebook_disconnect: function connect_facebook_disconnect(req, res, next) {
    q(req.user.disconnect_facebook_and_save())
    .then(function(updated_user) {
      res.redirect(server_config.util_route_success);
    })
    .fail(function(error) {
      logger.error('exports.connect_facebook_disconnect -- error during disconnect: ' + error);
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
    failureRedirect: '/access?reason=twitter_declined',
    failureFlash: true
  }),

  /**
   * Initiates request for Twitter authorization, to connect accounts, using passport to redirect to Twitter - this
   * API endpoint should be accessed directly by the browser, not via AJAX
   * @type {Function}
   */
  connect_twitter_auth: auth.passport.authorize('twitter-connect'),

  /**
   * Completes request for Twitter authentication for account connection
   * @type {Function}
   */
  connect_twitter_callback: auth.passport.authorize('twitter-connect', {
    successReturnToOrRedirect: 'strategy-callback-should-specify-redirectTo-in-all-cases',
    failureRedirect: '/profile?reason=twitter_declined',
    failureFlash: true
  }),

  /**
   * Disconnects user account from twitter, removing twitter-sourced fields from profile but does not deauth at Twitter
   */
  connect_twitter_disconnect: function connect_twitter_disconnect(req, res, next) {
    q(req.user.disconnect_twitter_and_save())
    .then(function(updated_user) {
      res.redirect(server_config.util_route_success);
    })
    .fail(function(error) {
      logger.error('exports.connect_twitter_disconnect -- error during disconnect: ' + error);
      res.redirect(server_config.util_route_failure);
    });
  }
};
