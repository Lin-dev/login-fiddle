'use strict';

var logger_module = require('app/util/logger');
var logger = logger_module.get('app/util/https_redirect/index');

module.exports = function(req, res, next) {
  if(!req.secure) {
    var redirect_to = 'https://' + req.get('host') + req.url;
    logger.trace('Redirecting from http://' + req.get('host') + req.url + ' to ' + redirect_to);
    res.redirect(redirect_to);
  }
  else {
    next();
  }
};
