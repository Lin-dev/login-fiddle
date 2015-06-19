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
  }
};
