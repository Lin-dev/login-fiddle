'use strict';

/**
 * Database-specific configuration
 */
module.exports = {
  name: 'login_fiddle', // configure.py: database
  user: 'login_fiddle', // configure.py: database
  password: 'login_fiddle', // configure.py: database
  dialect: 'postgres', // constant
  host: 'localhost', // configure.py: database
  port: '5432', // configure.py: database
  database_name_check_before_sync: /login_fiddle/, // configure.py: database
  schema: 'lfsq', // configure.py: database
  object_status: {
    created: 'sq_created_at', // constant
    updated: 'sq_updated_at', // constant
    deleted: 'sq_deleted_at', // constant
  },
  pool: {
    maxConnections: 10, // configure.py: database
    minConnections: 3, // configure.py: database
    maxIdleTime: 30000, // configure.py: database
  }
};
