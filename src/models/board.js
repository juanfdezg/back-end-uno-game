const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Board extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Game, {
        foreignKey: 'game_id',
      });
      this.belongsTo(models.Player, {
        foreignKey: 'player_id',
      });
    }
  }
  Board.init({
    player_id: DataTypes.INTEGER,
    game_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Board',
  });
  return Board;
};
