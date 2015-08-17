// NO LOGGING IN THIS FILE

define(function(require) {
  'use strict';

  var config = {
    app: {
      logged_in_cookie_name: 'logged_in', // configure.py: user-cookie
      q_longStackSupport: true, // configure.py: client
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
        fb_auth_url: '', // configure.py: client-oauth
        fb_reactivate_url: '', // configure.py: client-oauth
        fb_connect_url: '', // configure.py: client-oauth
        fb_disconnect_path: '/api/user/connect/fb/disconnect',
        fb_client_id: '', // configure.py: user-facebook
        google_auth_url: '', // configure.py: client-oauth
        google_reactivate_url: '', // configure.py: client-oauth
        google_connect_url: '', // configure.py: client-oauth
        google_disconnect_path: '/api/user/connect/google/disconnect',
        google_client_id: '', // configure.py: user-google
        twitter_auth_url: '', // configure.py: client-oauth
        twitter_reactivate_url: '', // configure.py: client-oauth
        twitter_connect_url: '', // configure.py: client-oauth
        twitter_disconnect_path: '/api/user/connect/twitter/disconnect',
        twitter_consumer_key: '', // configure.py: user-twitter
      }
    },
    logger: {
      root: {
        js: {
          conf: {
            level: 'trace', // configure.py: logger-js
            appenders: ['console']
          }
        },
        events_logger: {
          conf: {
            level: 'trace', // configure.py: logger-events
            appenders: ['console']
          }
        }
      }
    }
  };

  return config;
});
