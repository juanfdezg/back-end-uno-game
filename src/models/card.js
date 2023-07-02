const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Card extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Player, {
        foreignKey: 'player_id',
      });
      this.belongsTo(models.Deck, {
        foreignKey: 'deck_id',
      });
      this.hasOne(models.ActionCard, {
        foreignKey: 'id',
      });
      this.hasOne(models.NumberCard, {
        foreignKey: 'id',
      });
      this.hasOne(models.SpecialCard, {
        foreignKey: 'id',
      });
    }
  }
  Card.init({
    player_id: DataTypes.INTEGER,
    deck_id: DataTypes.INTEGER,
    type: DataTypes.STRING,
    play_order: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Card',
  });
  return Card;
};
