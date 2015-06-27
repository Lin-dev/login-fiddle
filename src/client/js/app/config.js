// NO LOGGING IN THIS FILE

define(function(require) {
  'use strict';

  var config = {
    app: {
      logged_in_cookie_name: 'logged_in'
    },
    apps: {
      user: {
        // TODO: Is it worth config'ing local_username_field = local_email and local_password_field = local_password?
        local_password_min_length: 8,
        local_password_max_length: 256,
        local_login_path: '/api/user/access/local/login',
        local_signup_path: '/api/user/access/local/signup',
        fb_auth_url: 'https://127.0.0.1:27974/api/user/access/fb/auth',
        fb_connect_url: 'https://127.0.0.1:27974/api/user/connect/fb/auth',
        fb_disconnect_url: 'https://127.0.0.1:27974/api/user/connect/fb/disconnect',
        fb_client_id: '',
        google_auth_url: 'https://127.0.0.1:27974/api/user/access/google/auth',
        google_connect_url: 'https://127.0.0.1:27974/api/user/connect/google/auth',
        google_disconnect_url: 'https://127.0.0.1:27974/api/user/connect/google/disconnect',
        google_client_id: '',
        twitter_auth_url: 'https://127.0.0.1:27974/api/user/access/twitter/auth',
        twitter_connect_url: 'https://127.0.0.1:27974/api/user/connect/twitter/auth',
        twitter_disconnect_url: 'https://127.0.0.1:27974/api/user/connect/twitter/disconnect',
        twitter_consumer_key: ''
      }
    },
    logger: {
      root: {
        js: {
          conf: {
            level: 'trace', // configure.py: js
            appenders: ['console']
          }
        },
        events_logger: {
          conf: {
            level: 'trace', // configure.py: events_logger
            appenders: ['console']
          }
        }
      }
    }
  };

  return config;
});
