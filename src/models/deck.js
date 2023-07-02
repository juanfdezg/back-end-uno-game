const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Deck extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Game, {
        foreignKey: 'game_id',
      });
      this.hasMany(models.Card, {
        foreignKey: 'id',
      });
    }
  }
  Deck.init({
    game_id: DataTypes.INTEGER,
    num_cards: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Deck',
  });
  return Deck;
};
