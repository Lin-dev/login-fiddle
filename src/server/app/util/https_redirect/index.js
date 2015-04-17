'use strict';

var logger_module = require('app/util/logger');
var logger = logger_module.get('app/util/https_redirect/index');
var server_config = require('app/config/server');

module.exports = function(req, res, next) {
  if(!req.secure) {
    var redirect_to = 'https://' + req.hostname +
      (server_config.https_port != 443 ? ':' + server_config.https_port : '') + req.url;
    logger.trace('Redirecting from http://' + req.get('host') + req.url + ' to ' + redirect_to);
    res.redirect(redirect_to);
  }
  else {
    next();
  }
};
