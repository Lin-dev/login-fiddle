'use strict';

var _ = require('underscore');

var auth = require('app/util/auth');
var user_config = require('app/config/user');
var logger_module = require('app/util/logger');
var logger = logger_module.get('app/api/session/router_impl');

//var keys_required_for_login = [user_config.local_auth.username_field, user_config.local_auth.password_field];
var keys_required_for_login = [user_config.local_auth.username_field, user_config.local_auth.password_field];
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
      facebook_email: req.user.facebook_email,
      facebook_name: req.user.facebook_name
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
      res.redirect('/api/util/success');
    });
  },

  /**
   * Initiates requests for Facebook authentication, using passport to redirect to Facebook - this API endpoint should
   * be access directly by the browser, not via AJAX
   * @type {Function}
   */
  access_facebook_auth: function(req, res, next) {
    logger.debug('exports.access_facebook_auth -- redir request to FB (display mode: ' + req.query.display + ')');
    (auth.passport.authenticate('facebook-auth', {
      scope: ['public_profile', 'email'],
      display: req.query.display
    }))(req, res, next);
  },

  /**
   * Completes requests for Facebook authentication
   * @type {Function}
   */
  access_facebook_callback: auth.passport.authenticate('facebook-auth', {
    successRedirect: '/profile',
    failureRedirect: '/access?reason=fb_declined',
    failureFlash: true
  }),

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
    successRedirect: '/api/util/success',
    failureRedirect: '/api/util/failure',
    failureFlash: true
  }),

  /**
   * Handles requests for local access account signup
   * @type {Function}
   */
  access_local_signup: auth.passport.authenticate('local-signup', {
    successRedirect: '/api/util/success',
    failureRedirect: '/api/util/failure',
    failureFlash: true
  })
};
