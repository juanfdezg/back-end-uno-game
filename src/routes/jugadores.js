const Router = require('koa-router');

const router = new Router();

// Mostrar información de todos los jugadores
router.get('jugadores.list', '/:gameId', async (ctx) => {
  try {
    const { gameId } = ctx.request.params;
    const players = await ctx.orm.Player.findAll({ where: { game_id: gameId } });
    if (players.length === 0) {
      ctx.body = 'No hay jugadores en este juego';
      ctx.status = 404;
    } else {
      ctx.body = players;
      ctx.status = 200;
    }
  } catch (error) {
    ctx.body = error;
    ctx.status = 400;
  }
});

// Mostrar información de un jugador
router.get('jugadores.show', '/:gameId/:numPlayer', async (ctx) => {
  try {
    const { gameId } = ctx.request.params;
    const { numPlayer } = ctx.request.params;
    const player = await ctx.orm.Player.findOne({
      where: { num_player: numPlayer, game_id: gameId },
    });
    if (!player) {
      ctx.body = 'No existe este jugador';
      ctx.status = 404;
    } else {
      ctx.body = player;
      ctx.status = 200;
    }
  } catch (error) {
    ctx.body = error;
    ctx.status = 400;
  }
});

module.exports = router;
