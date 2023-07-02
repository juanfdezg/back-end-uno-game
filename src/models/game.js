const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Game extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Player, {
        foreignKey: 'id',
      });
      this.hasMany(models.Board, {
        foreignKey: 'id',
      });
      this.hasMany(models.Deck, {
        foreignKey: 'id',
      });
    }
  }
  Game.init({
    total_players: DataTypes.INTEGER,
    active: DataTypes.BOOLEAN,
    victory_points: DataTypes.INTEGER,
    current_player: DataTypes.INTEGER,
    host_player: DataTypes.STRING,
    winner_player: DataTypes.STRING,
    turn_time: DataTypes.FLOAT,
    reverse: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Game',
  });
  return Game;
};
