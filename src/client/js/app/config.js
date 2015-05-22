// NO LOGGING IN THIS FILE

define(function(require) {
  'use strict';

  var config = {
    apps: {
      user: {
        password_min_length: 8,
        password_max_length: 256
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
