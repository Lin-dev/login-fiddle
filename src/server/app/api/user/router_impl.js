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
