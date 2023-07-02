const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NumberCard extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Card, {
        foreignKey: 'card_id',
      });
    }
  }
  NumberCard.init({
    card_id: DataTypes.INTEGER,
    value: DataTypes.INTEGER,
    color: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'NumberCard',
  });
  return NumberCard;
};
