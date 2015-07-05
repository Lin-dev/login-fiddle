// NO LOGGING IN THIS FILE

define(function(require) {
  'use strict';

  var config = {
    app: {
      logged_in_cookie_name: 'logged_in',
      q_long_stack_support: true
    },
    apps: {
      user: {
        local_password_min_length: 8,
        local_password_max_length: 256,
        logout_path: '/api/user/logout',
        deactivate_path: '/api/user/deactivate',
        local_login_path: '/api/user/access/local/login',
        local_signup_path: '/api/user/access/local/signup',
        local_reactivate_path: '/api/user/reactivate/local/login',
        local_connect_path: '/api/user/connect/local/connect',
        local_disconnect_path: '/api/user/connect/local/disconnect',
        fb_auth_url: 'https://127.0.0.1:27974/api/user/access/fb/auth',
        fb_reactivate_url: 'https://127.0.0.1:27974/api/user/reactivate/fb/auth',
        fb_connect_url: 'https://127.0.0.1:27974/api/user/connect/fb/auth',
        fb_disconnect_path: '/api/user/connect/fb/disconnect',
        fb_client_id: '',
        google_auth_url: 'https://127.0.0.1:27974/api/user/access/google/auth',
        google_reactivate_url: 'https://127.0.0.1:27974/api/user/reactivate/google/auth',
        google_connect_url: 'https://127.0.0.1:27974/api/user/connect/google/auth',
        google_disconnect_path: '/api/user/connect/google/disconnect',
        google_client_id: '',
        twitter_auth_url: 'https://127.0.0.1:27974/api/user/access/twitter/auth',
        twitter_reactivate_url: 'https://127.0.0.1:27974/api/user/reactivate/twitter/auth',
        twitter_connect_url: 'https://127.0.0.1:27974/api/user/connect/twitter/auth',
        twitter_disconnect_path: '/api/user/connect/twitter/disconnect',
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
