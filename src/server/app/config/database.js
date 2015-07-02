'use strict';

/**
 * Database-specific configuration
 */
module.exports = {
  name: 'login_fiddle',
  user: 'login_fiddle',
  password: 'login_fiddle',
  dialect: 'postgres',
  host: 'localhost',
  port: '5432',
  database_name_check_before_sync: /login_fiddle/,
  schema: 'lfsq',
  object_status: {
    created: 'sq_created_at',
    updated: 'sq_updated_at',
    deleted: 'sq_deleted_at'
  },
  pool: {
    maxConnections: 10,
    minConnections: 3,
    maxIdleTime: 30000
  }
};
