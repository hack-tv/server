'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      this.hasOne(models.Profile);
    }
  }

  User.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: 'Email already exists',
        },
        validate: {
          notNull: {
            msg: 'Email is required',
          },
          notEmpty: {
            msg: 'Email is required',
          },
          isEmail: {
            msg: 'Invalid email format',
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Password is required',
          },
          notEmpty: {
            msg: 'Password is required',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'User',
    }
  );

  return User;
};
