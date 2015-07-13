'use strict';

/**
 * User and user-session specific configuration
 */
module.exports = {
  fb: {
    client_id: '', // configure.py: user-facebook
    client_secret: '', // configure.py: user-facebook
    auth_callback_path: '/api/user/access/fb/callback', // constant
    reactivate_callback_path: '/api/user/reactivate/fb/callback', // constant
    connect_callback_path: '/api/user/connect/fb/callback', // constant
    scope: ['public_profile', 'email'], // constant
  },
  google: {
    client_id: '', // configure.py: user-google
    client_secret: '', // configure.py: user-google
    auth_callback_path: '/api/user/access/google/callback', // constant
    reactivate_callback_path: '/api/user/reactivate/google/callback', // constant
    connect_callback_path: '/api/user/connect/google/callback', // constant
    scope: ['profile', 'email'], // constant
  },
  local: {
    username_field: 'local_email', // constant
    username_max_length: 254,  // constant; ensure this agrees with value in client/js/apps/user/entities.js
    password_field: 'local_password', // constant
    password_max_length: 256, // constant
  },
  twitter: {
    consumer_key: '', // configure.py: user-twitter
    consumer_secret: '', // configure.py: user-twitter
    auth_callback_path: '/api/user/access/twitter/callback', // constant
    reactivate_callback_path: '/api/user/reactivate/twitter/callback', // constant
    connect_callback_path: '/api/user/connect/twitter/callback', // constant
  },
  logged_in_cookie_name: 'logged_in', // configure.py: user-cookie
  client_reactivate_path: '/profile/reactivate', // constant
  session: {
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // constant; default to one week
      secure: true, // constant
    },
    resave: false, // constant; to avoid race conditions, no need to be true so long as storage method supports save
    rolling: true, // constant; force cookie to be set on every response, resetting the expiration date
    secret: 'default', // configure.py: user-cookie; specified here so can be shared across nodes in cluster
    store: {
      host: 'localhost', // configure.py: user-cookie
      port: 6379, // configure.py: user-cookie
      db: 3, // configure.py: user-cookie
    }
  },
  salt_rounds: 10, // configure.py: user-security
};
