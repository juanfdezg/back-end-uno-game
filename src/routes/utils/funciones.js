const turno = async (ctx, gameId, skip) => {
  const game = await ctx.orm.Game.findOne({
    where: { id: gameId },
  });

  const valorSalto = skip ? 2 : 1;
  let nuevoTurno = 0;

  if (game.reverse) {
    nuevoTurno = (game.current_player - valorSalto) % game.total_players;
    if (nuevoTurno === 0) {
      nuevoTurno = 4;
    }
  } else {
    nuevoTurno = (game.current_player + valorSalto) % game.total_players;
    if (nuevoTurno === 0) {
      nuevoTurno = 4;
    }
  }

  return nuevoTurno;
};

const drawTwo = async (ctx, gameId, siguienteJugador) => {
  const game = await ctx.orm.Game.findOne({
    where: { id: gameId },
  });

  const mazoPrincipal = await ctx.orm.Deck.findOne({
    where: { game_id: gameId },
    order: [['id', 'ASC']],
    limit: 1,
  });

  const player = await ctx.orm.Player.findOne({
    where: { game_id: gameId, num_player: siguienteJugador },
  });

  const cards = await ctx.orm.Card.findAll({
    where: {
      player_id: null,
      deck_id: mazoPrincipal.id,
    },
    order: ctx.orm.sequelize.random(),
    limit: 2,
  });

  for (const card of cards) {
    card.player_id = player.id;
    card.deck_id = null;
    player.num_hand_cards += 1;
    await card.save();
    await player.save();
  }
};

const drawFourWild = async (ctx, gameId, siguienteJugador) => {
  const game = await ctx.orm.Game.findOne({
    where: { id: gameId },
  });

  const mazoPrincipal = await ctx.orm.Deck.findOne({
    where: { game_id: gameId },
    order: [['id', 'ASC']],
    limit: 1,
  });

  const player = await ctx.orm.Player.findOne({
    where: { game_id: gameId, num_player: siguienteJugador },
  });

  const cards = await ctx.orm.Card.findAll({
    where: {
      player_id: null,
      deck_id: mazoPrincipal.id,
    },
    order: ctx.orm.sequelize.random(),
    limit: 4,
  });

  for (const card of cards) {
    card.player_id = player.id;
    card.deck_id = null;
    player.num_hand_cards += 1;
    await card.save();
    await player.save();
  }
};

const newHand = async (ctx, gameId, numJugador) => {
  const game = await ctx.orm.Game.findOne({
    where: { id: gameId },
  });

  const mazoPrincipal = await ctx.orm.Deck.findOne({
    where: { game_id: gameId },
    order: [['id', 'ASC']],
    limit: 1,
  });

  const player = await ctx.orm.Player.findOne({
    where: { game_id: gameId, num_player: numJugador },
  });

  const cards = await ctx.orm.Card.findAll({
    where: {
      player_id: null,
      deck_id: mazoPrincipal.id,
    },
    order: ctx.orm.sequelize.random(),
    limit: 5,
  });

  for (const card of cards) {
    card.player_id = player.id;
    card.deck_id = null;
    player.num_hand_cards += 1;
    await card.save();
    await player.save();
  }
};

const fillDeck = async (ctx, gameId) => {
  const game = await ctx.orm.Game.findOne({
    where: { id: gameId },
  });

  const mazoPrincipal = await ctx.orm.Deck.findOne({
    where: { game_id: gameId },
    order: [['id', 'ASC']],
    limit: 1,
  });

  const mazoDescarte = await ctx.orm.Deck.findOne({
    where: { game_id: gameId },
    order: [['id', 'ASC']],
    offset: 1,
    limit: 1,
  });

  const cards = await ctx.orm.Card.findAll({
    where: {
      player_id: null,
      deck_id: mazoDescarte.id,
    },
    order: [['play_order', 'DESC']],
    offset: 1,
  });

  for (const card of cards) {
    card.deck_id = mazoPrincipal.id;
    card.play_order = null;
    await card.save();
  }
};

const funciones = {
  turno,
  drawTwo,
  drawFourWild,
  newHand,
  fillDeck,
};

module.exports = funciones;
