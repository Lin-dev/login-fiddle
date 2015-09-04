'use strict';

var bcrypt = require('bcrypt');

var user_config = require('app/config/user');
var database_config = require('app/config/database');
var logger_module = require('app/util/logger');
var logger = logger_module.get('app/util/pr/auth');

var user_find_scopes = ['all', 'activated', 'deactivated'];

module.exports = function(sequelize, DataTypes) {
  var models = {
    user: sequelize.define('user', {
      // Common
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        validate: {
          isUUID: 4
        },
        primaryKey: true
      },
      // Local
      local_email: {
        type: DataTypes.STRING(user_config.local.username_max_length),
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      local_password: {
        type: DataTypes.STRING(user_config.local.password_max_length),
        allowNull: true,
        validate: {
          is: /^[A-Za-z0-9.\/$]+$/, // regex matches a bcrypt hash, which is how password is stored
          len: [60, 60]
        }
      },
      // Facebook
      fb_id: {
        type: DataTypes.STRING(256),
        allowNull: true,
        unique: true
      },
      fb_token: {
        type: DataTypes.STRING(512),
        allowNull: true,
        unique: true
      },
      fb_name: {
        type: DataTypes.STRING(256),
        allowNull: true
      },
      fb_email: {
        type: DataTypes.STRING(254), // max length of email is 254
        allowNull: true,
        validate: {
          isEmail: true
        }
      },
      // Twitter
      twitter_id: {
        type: DataTypes.STRING(256),
        allowNull: true,
        unique: true
      },
      twitter_token: {
        type: DataTypes.STRING(512),
        allowNull: true,
        unique: true
      },
      twitter_username: {
        type: DataTypes.STRING(15), // twitter max username length is 15
        allowNull: true,
        unique: true
      },
      twitter_name: {
        type: DataTypes.STRING(256),
        allowNull: true
      },
      // Google
      google_id: {
        type: DataTypes.STRING(256),
        allowNull: true,
        unique: true
      },
      google_token: {
        type: DataTypes.STRING(512),
        allowNull: true,
        unique: true
      },
      google_name: {
        type: DataTypes.STRING(256),
        allowNull: true
      },
      google_email: {
        type: DataTypes.STRING(254), // max length of email is 254
        allowNull: true,
        validate: {
          isEmail: true
        }
      }
    }, {
      validate: {
        has_valid_account_source: function has_valid_account_source() {
          if(this.local_email && this.local_password) { return; } // local source
          else if(this.fb_id && this.fb_token) { return; } // fb source
          else if(this.twitter_id && this.twitter_token) { return; } // twitter source
          else if(this.google_id && this.google_token) { return; } // google source
          else { Error('No valid account source'); }
        }
      },

      scopes: {
        /**
         * Include activated and deactivated users in the query scope
         * @type {Object}
         */
        all: {
        },
        /**
         * Explicitly include only activated users in the query scope (this is also the default scope)
         * @type {Object}
         */
        activated: {
          where: {
            sq_deleted_at: null
          }
        },
        /**
         * Restrict scope to deactivated users in the query
         * @type {Object}
         */
        deactivated: {
          where: {
            sq_deleted_at: {
              $ne: null
            }
          }
        }
      },

      classMethods: {
        /**
         * Generates a password hash to write to the DB so that the unhashed password is never stored
         * @param  {String} unhashed_password The unhashed, user-submitted password (remember: use HTTPS!)
         * @return {String}                   The hashed password
         */
        hash_password: function hash_password(unhashed_password) {
          return bcrypt.hashSync(unhashed_password, bcrypt.genSaltSync(user_config.salt_rounds));
        },

        /**
         * Creates a user instance from a Facebook oauth profile object (from passport) and returns a promise for their
         * successful save to the DB
         * @param  {Object} fb_profile The profile sent by fb oauth
         * @param  {String} token            The string token sent by fb oauth
         * @return {Object}                  A promise for the new user's success persistence to the DB
         */
        create_from_fb_and_save: function create_from_fb_and_save(fb_profile, token) {
          var user_attrs = {
            fb_id: fb_profile.id,
            fb_token: token,
            fb_name: fb_profile.displayName,
            fb_email: fb_profile.emails ? fb_profile.emails[0].value : undefined
          };
          return this.create(user_attrs);
        },

        /**
         * Creates a user instance from a Google oauth profile object (from passport) and returns a promise for their
         * successful save to the DB
         * @param  {Object} google_profile The profile sent by google oauth
         * @param  {String} token          The string token sent by google oauth
         * @return {Object}                A promise for the new user's success persistence to the DB
         */
        create_from_google_and_save: function create_from_google_and_save(google_profile, token) {
          var user_attrs = {
            google_id: google_profile.id,
            google_token: token,
            google_name: google_profile.displayName,
            google_email: google_profile.emails ? google_profile.emails[0].value : undefined
          };
          return this.create(user_attrs);
        },

        /**
         * Creates a user instance from a Twitter oauth profile object (from passport) and returns a promise for their
         * successful save to the DB
         * @param  {Object} twitter_profile The profile sent by twitter oauth
         * @param  {String} token           The string token sent by twitter oauth
         * @return {Object}                 A promise for the new user's success persistence to the DB
         */
        create_from_twitter_and_save: function create_from_google_and_save(twitter_profile, token) {
          var user_attrs = {
            twitter_id: twitter_profile.id,
            twitter_token: token,
            twitter_username: twitter_profile.username,
            twitter_name: twitter_profile.displayName
          };
          return this.create(user_attrs);
        },

        /**
         * Finds a user (whether activated or deactivated) with the requested local username field (by default, email)
         * @param  {String} primary_id The primary UUID key of the user to find
         * @param  {String} scope      activated, deactivated or all (default)
         * @return {Object}            A promise for the result of the Sequelize find call
         */
        find_with_id: function find_with_id(primary_id, scope) {
          scope = scope || 'all';
          if(user_find_scopes.indexOf(scope) === -1) { throw new Error('Unknown user find scope: ' + scope); }
          return this.scope(scope).find({ where: { id: primary_id }, paranoid: false });
        },

        /**
         * Finds a user (whether activated or deactivated) with the requested local username field (by default, email)
         * @param  {String} username_value The local username to search for
         * @param  {String} scope          activated, deactivated or all (default)
         * @return {Object}                A promise for the result of the Sequelize find call
         */
        find_with_local_username: function find_with_local_username(username_value, scope) {
          scope = scope || 'all';
          if(user_find_scopes.indexOf(scope) === -1) { throw new Error('Unknown user find scope: ' + scope); }
          var where_object = {};
          where_object[user_config.local.username_field] = { ilike: username_value }; // case insensitive
          return this.scope(scope).find({ where: where_object, paranoid: false });
        },

        /**
         * Finds a user (whether activated or deactivated) with the requested facebook ID
         * @param  {String} fb_id The facebook ID to search for
         * @param  {String} scope activated, deactivated or all (default)
         * @return {Object}       A promise for the result of the Sequelize find call
         */
        find_with_fb_id: function find_with_fb_id(fb_id, scope) {
          scope = scope || 'all';
          if(user_find_scopes.indexOf(scope) === -1) { throw new Error('Unknown user find scope: ' + scope); }
          return this.scope(scope).find({ where: { fb_id: fb_id }, paranoid: false });
        },

        /**
         * Finds a user (whether activated or deactivated) with the requested google ID
         * @param  {String} google_id The Google ID to find
         * @param  {String} scope     activated, deactivated or all (default)
         * @return {Object}           A promise for the result of the Sequelize find call
         */
        find_with_google_id: function find_with_google_id(google_id, scope) {
          scope = scope || 'all';
          if(user_find_scopes.indexOf(scope) === -1) { throw new Error('Unknown user find scope: ' + scope); }
          return this.scope(scope).find({ where: { google_id: google_id }, paranoid: false });
        },

        /**
         * Finds a user (whether activated or deactivated) with the requested twitter ID
         * @param  {String} twitter_id The twitter ID to find
         * @param  {String} scope      activated, deactivated or all (default)
         * @return {Object}            A promise for the result of the Sequelize find call
         */
        find_with_twitter_id: function find_with_twitter_id(twitter_id, scope) {
          scope = scope || 'all';
          if(user_find_scopes.indexOf(scope) === -1) { throw new Error('Unknown user find scope: ' + scope); }
          return this.scope(scope).find({ where: { twitter_id: twitter_id }, paranoid: false });
        }
      },

      instanceMethods: {
        /**
         * Compares a submitted (unhashed) password with the expected password hash for this user by hashing it
         * @param  {String}  unhashed_password The unhashed, user-submitted password (remember: use HTTPS!)
         * @return {Boolean}                   True if the unhashed_password hash matches the stored hash
         */
        check_password: function check_password(unhashed_password) {
          return bcrypt.compareSync(unhashed_password, this.local_password);
        },

        /**
         * Returns an array of connected auth providers (e.g. ['google', 'fb', 'twitter', 'local']) for this user
         */
        connected_auth_providers: function connected_auth_providers() {
          var providers = [];
          if(this.get('local_email')) {
            providers.push('local');
          }
          if(this.get('fb_id')) {
            providers.push('fb');
          }
          if(this.get('google_id')) {
            providers.push('google');
          }
          if(this.get('twitter_id')) {
            providers.push('twitter');
          }
          return providers;
        },

        /**
         * Updates this user instance with connected email and password and saves it
         * @param  {Object} local_profile The user's email address and hashed password
         * @return {Object}               A promise for completion of the user instance save
         */
        connect_local_and_save: function connect_local_and_save(local_profile) {
          logger.trace('exports.connect_local_and_save -- connecting: ' + JSON.stringify(local_profile));
          this.set(user_config.local.username_field, local_profile[user_config.local.username_field]);
          this.set(user_config.local.password_field, local_profile[user_config.local.password_field]);
          return this.save();
        },

        /**
         * Updates this user instance by removing disconnected local account info and saves it
         * @return {Object} A promise for completion of the user instance save
         */
        disconnect_local_and_save: function disconnect_local_and_save() {
          logger.trace('exports.disconnect_local_and_save -- disconnecting');
          var auth_providers = this.connected_auth_providers();
          if(auth_providers.length > 1) {
            this.set(user_config.local.username_field, null);
            this.set(user_config.local.password_field, null);
            return this.save();
          }
          else {
            throw new Error('Cannot disc local - user only has following providers: ' + JSON.stringify(auth_providers));
          }
        },

        /**
         * Updates this user instance with connected Facebook account info and saves it
         * @param  {Object} fb_profile The raw Facebook profile as returned by oauth (passport)
         * @param  {String} token      The oauth token sent by FB
         * @return {Object}            A promise for completion of the user instance save
         */
        connect_fb_and_save: function connect_fb_and_save(fb_profile, token) {
          logger.trace('exports.connect_fb_and_save -- connecting: ' + JSON.stringify(fb_profile));
          this.set({
            fb_id: fb_profile.id,
            fb_token: token,
            fb_name: fb_profile.displayName,
            fb_email: fb_profile.emails ? fb_profile.emails[0].value : undefined
          });
          return this.save();
        },

        /**
         * Updates this user instance by removing disconnected FB account info and saves it, does not alter auth
         * status on FB
         * @return {Object} A promise for completion of the user instance save
         */
        disconnect_fb_and_save: function disconnect_fb_and_save() {
          logger.trace('exports.disconnect_fb_and_save -- disconnecting: ' + this.fb_id);
          var auth_providers = this.connected_auth_providers();
          if(auth_providers.length > 1) {
            this.set({
              fb_id: null,
              fb_token: null,
              fb_name: null,
              fb_email: null
            });
            return this.save();
          }
          else {
            throw new Error('Cannot disc local - user only has following providers: ' + JSON.stringify(auth_providers));
          }
        },

        /**
         * Updates this user instance with connected Google account info and saves it
         * @param  {Object} google_profile The raw Google profile as returned by oauth (passport)
         * @param  {String} token          The oauth token sent by Google
         * @return {Object}                A promise for completion of the user instance save
         */
        connect_google_and_save: function connect_google_and_save(google_profile, token) {
          logger.trace('exports.connect_google_and_save -- connecting: ' + JSON.stringify(google_profile));
          this.set({
            google_id: google_profile.id,
            google_token: token,
            google_name: google_profile.displayName,
            google_email: google_profile.emails ? google_profile.emails[0].value : undefined
          });
          return this.save();
        },

        /**
         * Updates this user instance by removing disconnected Google account info and saves it, does not alter auth
         * status on Google
         * @return {Object} A promise for completion of the user instance save
         */
        disconnect_google_and_save: function disconnect_google_and_save() {
          logger.trace('exports.disconnect_google_and_save -- disconnecting: ' + this.twitter_id);
          var auth_providers = this.connected_auth_providers();
          if(auth_providers.length > 1) {
            this.set({
              google_id: null,
              google_token: null,
              google_name: null,
              google_email: null
            });
            return this.save();
          }
          else {
            throw new Error('Cannot disc local - user only has following providers: ' + JSON.stringify(auth_providers));
          }
        },

        /**
         * Updates this user instance with connected twitter account info and saves it
         * @param  {Object} twitter_profile The raw twitter profile as returned by oauth (passport)
         * @param  {String} token           The oauth token sent by twitter
         * @return {Object}                 A promise for completion of the user instance save
         */
        connect_twitter_and_save: function connect_twitter_and_save(twitter_profile, token) {
          logger.trace('exports.connect_twitter_and_save -- connecting: ' + JSON.stringify(twitter_profile));
          this.set({
            twitter_id: twitter_profile.id,
            twitter_token: token,
            twitter_username: twitter_profile.username,
            twitter_name: twitter_profile.displayName
          });
          return this.save();
        },

        /**
         * Updates this user instance by removing disconnected twitter account info and saves it, does not alter auth
         * status on twitter
         * @return {Object} A promise for completion of the user instance save
         */
        disconnect_twitter_and_save: function disconnect_twitter_and_save() {
          logger.trace('exports.disconnect_twitter_and_save -- disconnecting: ' + this.twitter_id);
          var auth_providers = this.connected_auth_providers();
          if(auth_providers.length > 1) {
            this.set({
              twitter_id: null,
              twitter_token: null,
              twitter_username: null,
              twitter_name: null
            });
            return this.save();
          }
          else {
            throw new Error('Cannot disc local - user only has following providers: ' + JSON.stringify(auth_providers));
          }
        },

        /**
         * Returns the activated status of a user object and the account it represents
         * @return {Boolean} True if the account is activated, false otherwise
         */
        is_active: function is_active() {
          return this.get(database_config.object_status.deleted) === null;
        },

        /**
         * Deactivates an account, marking it as inactive (current implementation: Sequelize `destroy`, which sets the
         * delete-at field to the time of deletion)
         * @return {Object} A promise for completion of the user instance save
         */
        deactivate_and_save: function deactivate_and_save() {
          if(!this.is_active()) {
            throw new Error('Attempted to deactivate inactive user model: ' + JSON.stringify(this));
          }
          else {
            return this.destroy();
          }
        },

        /**
         * Restores an account, marking it as active (current implementation: Sequelize `restore`, which sets the
         * delete-at field null)
         * @return {Object} A promise for completion of the user instance save
         */
        reactivate_and_save: function restore_and_save() {
          if(this.is_active()) {
            throw new Error('Attempted to reactivate active user model: ' + JSON.stringify(this));
          }
          else {
            return this.restore();
          }
        }
      }
    })
  };

  return models;
};
