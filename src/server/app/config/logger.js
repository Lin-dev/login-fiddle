'use strict';

var moment = require('moment');

/**
 * Logger-specific configuration
 */
module.exports = {
  express_format: ':date EXPRESS [:remote-addr] ":method :url HTTP/:http-version" :status ":referrer" ":user-agent"',
  custom_tokens: [{
    token: ':date',
    replacement: function replacement() {
      return moment().format('YYYY-MM-DD HH:mm:ss.SSS');
    }
  }]
};
