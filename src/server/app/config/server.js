'use strict';

var path = require('path');

/**
 * General application configuration not associated with a specific bucket
 */
module.exports = {
  http_port: 27973,
  https_port: 27974,
  server_host: '127.0.0.1',
  server_protocol: 'https',
  server_root: __dirname,
  client_root: path.join(__dirname, '..', '..', '..', 'client'), // .. x3 to cancel out server/app/config
  security_dir: path.join(__dirname, '..', '..', '..', 'security'), // .. x3 to cancel out server/app/config
  util_route_success: '/api/util/success',
  util_route_failure: '/api/util/failure',
  q_longStackSupport: false,
  static_max_age: 1000
};
