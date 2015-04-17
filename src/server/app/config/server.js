'use strict';

var path = require('path');

/**
 * General application configuration not associated with a specific bucket
 */
module.exports = {
  http_port: 27973,
  https_port: 27974,
  server_root: __dirname,
  client_root: path.join(__dirname, '..', '..', '..', 'client'), // .. x3 to cancel out server/app/config
  security_dir: path.join(__dirname, '..', '..', '..', 'security'), // .. x3 to cancel out server/app/config
  q_longStackSupport: false,
  static_max_age: 1000,
  session: {
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // default to one week
      secure: true
    },
    resave: false, // to avoid race conditions, no need to be true so long as storage method supports save
    secret: 'default', // can not be randomly generated else sessions can't be shared across nodes in cluster
    store: {
      host: 'localhost',
      port: 6379,
      db: 3
    }
  }
};
