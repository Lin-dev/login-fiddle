'use strict';

var bcrypt = require('bcrypt');

var server_config = require('app/config/server');

module.exports = function(sequelize, DataTypes) {
  var models = {
    user: sequelize.define('user', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        validate: {
          isUUID: 4
        },
        primaryKey: true
      },
      email: {
        type: DataTypes.STRING(60),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING(60),
        allowNull: false,
        validate: {
          is: /^[A-Za-z0-9.\/$]+$/, // regex matches a bcrypt hash, which is how password is stored
          len: [60, 60]
        }
      }
    }, {
      classMethods: {
        /**
         * Generates a password hash to write to the DB so that the unhashed password is never stored
         * @param  {String} unhashed_password The unhashed, user-submitted password (remember: use HTTPS!)
         * @return {String}                   The hashed password
         */
        hash_password: function(unhashed_password) {
          return bcrypt.hashSync(unhashed_password, bcrypt.genSaltSync(server_config.salt_rounds));
        }
      },

      instanceMethods: {
        /**
         * Compares a submitted (unhashed) password with the expected password hash for this user by hashing it
         * @param  {String}  unhashed_password The unhashed, user-submitted password (remember: use HTTPS!)
         * @return {Boolean}                   True if the unhashed_password hash matches the stored hash
         */
        check_password: function(unhashed_password) {
          return bcrypt.compareSync(unhashed_password, this.password);
        }
      }
    })
  };

  return models;
};
