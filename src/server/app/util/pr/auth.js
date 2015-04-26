'use strict';

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
        type: DataTypes.STRING(30),
        allowNull: false,
        validate: {
          isAlphanumeric: true,
          len: [2, 30]
        }
      },
      password: {
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
