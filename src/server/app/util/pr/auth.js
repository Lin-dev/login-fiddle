'use strict';

var bcrypt = require('bcrypt');

var user_config = require('app/config/user');

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
        type: DataTypes.STRING(user_config.local_auth.username_max_length),
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      local_password: {
        type: DataTypes.STRING(user_config.local_auth.password_max_length),
        allowNull: true,
        validate: {
          is: /^[A-Za-z0-9.\/$]+$/, // regex matches a bcrypt hash, which is how password is stored
          len: [60, 60]
        }
      },
      // Facebook
      facebook_id: {
        type: DataTypes.STRING(256),
        allowNull: true,
        unique: true
      },
      facebook_token: {
        type: DataTypes.STRING(512),
        allowNull: true,
        unique: true
      },
      facebook_name: {
        type: DataTypes.STRING(256),
        allowNull: true
      },
      facebook_email: {
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
          else if(this.facebook_id && this.facebook_token) { return; } // facebook source
          else if(this.twitter_id && this.twitter_token) { return; } // twitter source
          else if(this.google_id && this.google_token) { return; } // google source
          else { Error('No valid account source'); }
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
        }
      }
    })
  };

  return models;
};
