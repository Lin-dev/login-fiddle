'use strict';

var auth = require('app/util/auth');
//var logger_module = require('app/util/logger');
//var logger = logger_module.get('app/api/session/router_impl');

module.exports = {
  get_user: function(pr, req, res, next) {
    // TODO
  },

  put_user: function(pr, req, res, next) {
    // TODO
  },

  delete_user: function(pr, req, res, next) {
    // TODO
  },

  login: function(req, res, next) {
    return auth.passport.authenticate('local-login', {
      successRedirect: '/user',
      failureRedirect: '/login',
      failureFlash: true
    });
  },

  logout: function(req, res, next) {
    req.logout();
    req.flash('logout_message', 'Logged out');
    res.redirect('/');
  },

  signup: function(req, res, next) {
    return auth.passport.authenticate('local-signup', {
      successRedirect: '/user',
      failureRedirect: '/signup',
      failureFlash: true
    });
  }
};
