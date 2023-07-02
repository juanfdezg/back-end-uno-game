const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Player extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'user_id',
      });
      this.belongsTo(models.Game, {
        foreignKey: 'game_id',
      });
      this.hasOne(models.Board, {
        foreignKey: 'id',
      });
      this.hasMany(models.Card, {
        foreignKey: 'id',
      });
    }
  }
  Player.init({
    user_id: DataTypes.INTEGER,
    game_id: DataTypes.INTEGER,
    victory_points: DataTypes.INTEGER,
    num_player: DataTypes.INTEGER,
    num_hand_cards: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Player',
  });
  return Player;
};
