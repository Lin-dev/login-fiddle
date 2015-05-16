'use strict';

var auth = require('app/util/auth');
var server_config = require('app/config/server');
//var logger_module = require('app/util/logger');
//var logger = logger_module.get('app/api/session/router_impl');

module.exports = {
  /**
   * Returns user description - assumes that the requester must be logged in to access this API endpoint
   */
  get_user: function(pr, req, res, next) {
    var result = {
      email: req.user.email,
      signup_date: req.user.sq_created_at
    };
    res.status(200).send(result);
  },

  /**
   * Logs user out and destroys session (the logic for this: if they're logging out then in user's mind this session
   * is over)
   */
  logout: function(req, res, next) {
    req.logout();
    res.clearCookie(server_config.logged_in_cookie_name);
    req.session.destroy(function() {
      // No req.flash message because we just destroyed the session: req.flash('message', 'Logged out');
      res.redirect('/api/util/success');
    });
  },

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
