/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Games', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      total_players: {
        type: Sequelize.INTEGER,
      },
      active: {
        type: Sequelize.BOOLEAN,
      },
      victory_points: {
        type: Sequelize.INTEGER,
      },
      current_player: {
        type: Sequelize.INTEGER,
      },
      host_player: {
        type: Sequelize.STRING,
      },
      winner_player: {
        type: Sequelize.STRING,
      },
      turn_time: {
        type: Sequelize.FLOAT,
      },
      reverse: {
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Games');
  },
};
