'use strict';

/**
 * User and user-session specific configuration
 */
module.exports = {
  facebook_auth: {
    client_id: '', // configure.py: facebook
    client_secret: '', // configure.py: facebook
    callback_url: 'https://localhost:27974/api/user/access/facebook/callback' // configure.py: facebook
  },
  google_auth: {
    client_id: '', // configure.py: google
    client_secret: '', // configure.py: google
    callback_url: 'https://localhost:27974/api/user/access/google/callback' // configure.py: google
  },
  local_auth: {
    username_field: 'local_email',
    username_max_length: 254, // ensure this agrees with value in client/js/apps/user/entities.js
    password_field: 'local_password',
    password_max_length: 256
  },
  twitter_auth: {
    consumer_key: '', // configure.py: twitter
    consumer_secret: '', // configure.py: twitter
    callback_url: 'https://127.0.0.1:27974/api/user/access/twitter/callback' // configure.py: twitter
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
      host: 'localhost', // configure.py: store
      port: 6379, // configure.py: store
      db: 3 // configure.py: store
    }
  },
  salt_rounds: 10
};
