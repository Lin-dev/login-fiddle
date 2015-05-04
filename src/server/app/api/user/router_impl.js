'use strict';

var auth = require('app/util/auth');
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

  login: function(req, res, next) {
    return auth.passport.authenticate('local-login', {
      successRedirect: '/api/util/success',
      failureRedirect: '/api/util/failure',
      failureFlash: true
    });
  },

  logout: function(req, res, next) {
    req.logout();
    req.flash('message', 'Logged out');
    res.redirect('/api/util/success');
  },

  signup: auth.passport.authenticate('local-signup', {
      successRedirect: '/api/util/success',
      failureRedirect: '/api/util/failure',
      failureFlash: true
    })
};
