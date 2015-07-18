'use strict';

var path = require('path');

/**
 * General application configuration not associated with a specific bucket
 */
module.exports = {
  http_port: 27973, // configure.py: server
  https_port: 27974, // configure.py: server
  server_host: '127.0.0.1', // configure.py: server
  server_protocol: 'https', // constant
  server_root: __dirname, // constant
  client_root: path.join(__dirname, '..', '..', '..', 'client'), // constant; .. x3 to cancel out server/app/config
  security_dir: path.join(__dirname, '..', '..', '..', 'security'), // constant; .. x3 to cancel out server/app/config
  util_route_success: '/api/util/success', // constant
  util_route_failure: '/api/util/failure', // constant
  q_longStackSupport: false, // configure.py: server
  static_max_age: 1000, // configure.py: server
};
