'use strict';

module.exports = function(sequelize, DataTypes) {
  var models = {
    user: sequelize.define('user', {
      email: {
        type: DataTypes.STRING(30),
        allowNull: false,
        validate: {
          isAlphanumeric: true,
          len: [2, 30]
        }
      },
      password_hash: {
        type: DataTypes.STRING(60),
        allowNull: false,
        validate: {
          is: /^[A-Za-z0-9.\/$]+$/,
          len: [60, 60]
        }
      }
    })
  };

  return models;
};
