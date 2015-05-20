'use strict';

/**
 * User and user-session specific configuration
 */
module.exports = {
  local_auth: {
    username_field: 'local_email',
    password_field: 'local_password',
  },
  logged_in_cookie_name: 'logged_in',
  session: {
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // default to one week
      secure: true
    },
    resave: false, // to avoid race conditions, no need to be true so long as storage method supports save
    rolling: true, // force cookie to be set on every response, resetting the expiration date
    secret: 'default', // can not be randomly generated else sessions can't be shared across nodes in cluster
    store: {
      host: 'localhost',
      port: 6379,
      db: 3
    }
  },
  salt_rounds: 10
};
