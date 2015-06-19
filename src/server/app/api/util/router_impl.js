'use strict';

var api_util_config = require('app/config/api_util');
var logger_module = require('app/util/logger');
var logger = logger_module.get('app/api/util/router_impl');

module.exports = {
  /**
   * Used for signalling success to the client - server actions can redirect to this API endpoint
   */
  success: function success(req, res, next) {
    var result = {
      status: 'success',
      message: req.flash('message')[0]
    };
    res.status(200).send(result);
  },

  /**
   * Used for signalling failure to the client - server actions can redirect to this API endpoint
   */
  failure: function failure(req, res, next) {
    var result = {
      status: 'failure',
      message: req.flash('message')[0]
    };
    res.status(200).send(result);
  },

  /**
   * Used for retrieving flash messages to be displayed in the client FlashMessage view layout component
   */
  flash_message: function flash_message(req, res, next) {
    var result = {};
    result[api_util_config.flash_message_key] = req.flash(api_util_config.flash_message_key)[0];
    res.status(200).send(result);
  },

  /**
   * Expects `req.session.redirect_to` to be set, unsets this session variable and then redirects to it. If the
   * session variable is not set the middleware logs an error and sends an internal server error. It does not call
   * next() as it always either redirects or sends a server error
   */
  redirect_to: function redirect_to(req, res, next) {
    if(req.session.redirect_to) {
      var url = req.session.redirect_to;
      delete req.session.redirect_to;
      res.redirect(url);
    }
    else {
      logger.error('exports.redirect_to -- redirect_to is falsey but should be set to a redirect URL');
      res.status(500).send('Internal server error');
    }
  },

  /**
   * Redirects request to /profile
   */
  redirect_to_profile: function redirect_to_profile(req, res, next) {
    res.redirect('/profile');
  }
};
