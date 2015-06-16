'use strict';

/**
 * User and user-session specific configuration
 */
module.exports = {
  facebook: {
    client_id: '', // configure.py: facebook
    client_secret: '', // configure.py: facebook
    auth_callback_url: '/api/user/access/facebook/callback', // configure.py: facebook
    connect_callback_url: '/api/user/connect/facebook/callback', // configure.py: facebook
    scope: ['public_profile', 'email']
  },
  google: {
    client_id: '', // configure.py: google
    client_secret: '', // configure.py: google
    auth_callback_url: '/api/user/access/google/callback', // configure.py: google
    connect_callback_url: '/api/user/connect/google/callback', // configure.py: google
    scope: ['profile', 'email']
  },
  local: {
    username_field: 'local_email',
    username_max_length: 254, // ensure this agrees with value in client/js/apps/user/entities.js
    password_field: 'local_password',
    password_max_length: 256
  },
  twitter: {
    consumer_key: '', // configure.py: twitter
    consumer_secret: '', // configure.py: twitter
    auth_callback_url: '/api/user/access/twitter/callback', // configure.py: twitter
    connect_callback_url: '/api/user/connect/twitter/callback' // configure.py: twitter
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
