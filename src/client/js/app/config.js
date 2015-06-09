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
        facebook_auth_url: 'https://localhost:27974/api/user/access/facebook/auth',
        facebook_redirect_url: 'https://localhost:27974/api/user/access/facebook/callback',
        facebook_client_id: '',
        google_client_id: '',
        google_auth_url: 'https://localhost:27974/api/user/access/google/auth',
        google_redirect_url: 'https://localhost:27974/api/user/access/google/callback',
        twitter_consumer_key: '',
        twitter_auth_url: 'https://127.0.0.1:27974/api/user/access/twitter/auth',
        twitter_redirect_url: 'https://127.0.0.1:27974/api/user/access/twitter/callback'
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
