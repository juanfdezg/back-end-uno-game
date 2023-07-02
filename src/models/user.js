const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Player, {
        foreignKey: 'id',
      });
    }
  }
  User.init({
    username: {
      type: DataTypes.STRING,
      validate: {
        isAlphanumeric: {
          msg: 'The username can only contain letters and numbers',
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        isValidPassword(value) {
          if (!value.match(/[a-z]/) || !value.match(/[0-9]/) || !value.match(/[@$!%*?&]/)) {
            throw new Error('The password must contain at least one letter, one number and one special character');
          }
        },
      },
    },
    mail: {
      type: DataTypes.STRING,
      validate: {
        isEmail: {
          msg: 'The mail must have email format',
        },
      },
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
