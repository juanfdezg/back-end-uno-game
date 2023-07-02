const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SpecialCard extends Model {
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
  SpecialCard.init({
    card_id: DataTypes.INTEGER,
    power: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'SpecialCard',
  });
  return SpecialCard;
};
