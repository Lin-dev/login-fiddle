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

  /**
   * Logs user out and destroys session (the logic for this: if they're logging out then in user's mind this session
   * is over)
   */
  logout: function(req, res, next) {
    req.logout();
    req.session.destroy();
    req.flash('message', 'Logged out');
    res.redirect('/api/util/success');
  },

  /**
   * Handles requests for lcoal access (either account creation or login)
   * @type {Function}
   */
  access_local: auth.passport.authenticate('access-local', {
      successRedirect: '/api/util/success',
      failureRedirect: '/api/util/failure',
      failureFlash: true
    })
};
