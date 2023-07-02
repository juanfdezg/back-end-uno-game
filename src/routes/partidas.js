const Router = require("koa-router");

const router = new Router();

// Mostrar las partidas
router.get("partidas.list", "/list", async (ctx) => {
  try {
    const partidas = await ctx.orm.Game.findAll();
    if (partidas.length === 0) {
      ctx.body = {
        detail: "No se encontraron partidas",
      };
      ctx.status = 404;
    } else {
      ctx.body = partidas;
      ctx.status = 200;
    }
  } catch (error) {
    ctx.throw(error);
    ctx.body = {
      detail:
        "Ha ocurrido un problema intentando mostrar las partidas, intentar nuevamente",
    };
    ctx.status = 400;
  }
});

// Mostrar una partida en específico
router.get("partidas.show", "/show/:gameId", async (ctx) => {
  try {
    const { gameId } = ctx.params;
    const partida = await ctx.orm.Game.findOne({
      where: { id: gameId },
      attributes: [
        "id",
        "total_players",
        "active",
        "victory_points",
        "current_player",
        "host_player",
        "winner_player",
        "turn_time",
        "reverse",
      ],
    });
    if (partida.length === 0) {
      ctx.body = {
        detail: "No se encontró la partida",
      };
      ctx.status = 404;
    } else {
      ctx.body = {
        id: partida.dataValues.id,
        total_players: partida.dataValues.total_players,
        active: partida.dataValues.active,
        victory_points: partida.dataValues.victory_points,
        current_player: partida.dataValues.current_player,
        host_player: partida.dataValues.host_player,
        winner_player: partida.dataValues.winner_player,
        turn_time: partida.dataValues.turn_time,
        reverse: partida.dataValues.reverse,
      };
      ctx.status = 200;
    }
  } catch (error) {
    ctx.throw(error);
    ctx.body = {
      detail:
        "Ha ocurrido un problema intentando mostrar la partida, intentar nuevamente",
    };
    ctx.status = 400;
  }
});

// Mostrar las partidas propias creadas
router.get("partidas.list", "/showOwn/:username", async (ctx) => {
  try {
    const nombreUsuario = ctx.request.params.username;
    const partidas = await ctx.orm.Game.findAll({
      where: { host_player: nombreUsuario },
    });
    if (partidas.length === 0) {
      ctx.body = {
        detail: "No se encontraron partidas creadas por el usuario",
      };
      ctx.status = 404;
    } else {
      ctx.body = partidas;
      ctx.status = 200;
    }
  } catch (error) {
    ctx.throw(error);
    ctx.body = {
      detail:
        "Ha ocurrido un problema intentando mostrar las partidas, intentar nuevamente",
    };
    ctx.status = 400;
  }
});

// Mostrar todas las partidas en donde ha participado un jugador en particular
router.get("partidas.list", "/showParticipated/:username", async (ctx) => {
  try {
    const nombreUsuario = ctx.request.params.username;
    const user = await ctx.orm.User.findOne({
      where: { username: nombreUsuario },
    });
    const players = await ctx.orm.Player.findAll({
      where: { user_id: user.dataValues.id },
    });

    const partidas = [];
    for (let i = 0; i < players.length; i += 1) {
      const partida = await ctx.orm.Game.findAll({
        where: { id: players[i].dataValues.game_id },
      });
      partidas.push(partida);
    }

    if (partidas.length === 0) {
      ctx.body = {
        detail:
          "No se encontraron partidas en donde el usuario haya participado",
      };
      ctx.status = 404;
    } else {
      ctx.body = partidas;
      ctx.status = 200;
    }
  } catch (error) {
    ctx.throw(error);
    ctx.body = {
      detail:
        "Ha ocurrido un problema intentando mostrar las partidas, intentar nuevamente",
    };
    ctx.status = 400;
  }
});

// Crear una nueva partida
router.post("partidas.create", "/create", async (ctx) => {
  try {
    // Recibimos los datos de la partida
    const { usernames } = ctx.request.body;
    const victoryPoints = ctx.request.body.victory_points;
    const turnTime = ctx.request.body.turn_time;
    const hostPlayer = usernames[0];

    let usuariosValidos = true;
    for (let i = 0; i < usernames.length; i += 1) {
      const validUser = usernames[i];
      // Encontramos el usuario
      const usuarioCheck = await ctx.orm.User.findOne({
        where: { username: validUser },
      });
      if (usuarioCheck === null) {
        usuariosValidos = false;
      }
    }

    if (usuariosValidos) {
      // Datos necesarios para la creación de una partida
      ctx.request.body.total_players = usernames.length;
      ctx.request.body.active = true;
      ctx.request.body.victory_points = victoryPoints;
      ctx.request.body.current_player = 1;
      ctx.request.body.host_player = hostPlayer;
      ctx.request.body.winner_player = null;
      ctx.request.body.turn_time = turnTime;
      ctx.request.body.reverse = false;

      // Crear la partida
      const partida = await ctx.orm.Game.create(ctx.request.body);
      // Creamos el mazo principal donde los jugadores sacarán cartas
      const mazoPrincipal = await ctx.orm.Deck.create({
        game_id: partida.dataValues.id,
        num_cards: 0,
      });
      // Creamos el mazo de descarte
      const mazoDescarte = await ctx.orm.Deck.create({
        game_id: partida.dataValues.id,
        num_cards: 0,
      });
      // Creamos el mazo especial
      const mazoMisterioso = await ctx.orm.Deck.create({
        game_id: partida.dataValues.id,
        num_cards: 0,
      });

      // Creamos las cartas
      const colors = ["red", "blue", "green", "yellow"];
      const specialCards = ["Skip", "Reverse", "Draw Two"];
      const wildCards = ["Wild", "Wild Draw Four"];

      const cards = [];
      let cardId = 1;

      const updatePromises = [];

      for (let j = 0; j < 2; j += 1) {
        for (const color of colors) {
          // Number cards
          for (let i = 0; i <= 9; i += 1) {
            cards.push({
              player_id: null,
              deck_id: mazoPrincipal.dataValues.id,
              type: "NumberCard",
              createdAt: new Date(),
              updatedAt: new Date(),
              NumberCard: {
                card_id: cardId,
                value: i,
                color,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });
            cardId += 1;

            // Aumentamos la cantidad de cartas del mazo principal
            mazoPrincipal.num_cards += 1;
          }

          // Special cards
          for (const specialCard of specialCards) {
            cards.push({
              player_id: null,
              deck_id: mazoPrincipal.dataValues.id,
              type: "ActionCard",
              createdAt: new Date(),
              updatedAt: new Date(),
              ActionCard: {
                card_id: cardId,
                action: specialCard,
                color,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });
            cardId += 1;

            // Aumentamos la cantidad de cartas del mazo principal
            mazoPrincipal.num_cards += 1;
          }
        }
      }
      // Wild cards
      for (let j = 0; j < 2; j += 1) {
        for (const wildCard of wildCards) {
          cards.push({
            player_id: null,
            deck_id: mazoPrincipal.dataValues.id,
            type: "ActionCard",
            createdAt: new Date(),
            updatedAt: new Date(),
            ActionCard: {
              card_id: cardId,
              action: wildCard,
              color: "none",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
          cardId += 1;

          // Aumentamos la cantidad de cartas del mazo principal
          mazoPrincipal.num_cards += 1;
        }
      }

      updatePromises.push(mazoPrincipal.save());
      await Promise.all(updatePromises);
      // Creamos las cartas
      await ctx.orm.Card.bulkCreate(cards, {
        include: [{ model: ctx.orm.NumberCard }, { model: ctx.orm.ActionCard }],
      });

      // Iteramos sobre los usuarios y creamos los jugadores
      for (let i = 0; i < usernames.length; i += 1) {
        const usernameObtained = usernames[i];
        // Encontramos el usuario
        const user = await ctx.orm.User.findOne({
          where: { username: usernameObtained },
        });

        // Creamos el jugador
        const player = await ctx.orm.Player.create({
          user_id: user.dataValues.id,
          game_id: partida.dataValues.id,
          victory_points: 0,
          num_player: i + 1,
          num_hand_cards: 0,
        });
        // Creamos los tableros para cada jugador
        const tablero = await ctx.orm.Board.create({
          game_id: partida.dataValues.id,
          player_id: player.dataValues.id,
        });

        // Le asociamos 5 cartas aleatorias iniciales
        const initialCards = await ctx.orm.Card.findAll({
          where: {
            deck_id: mazoPrincipal.dataValues.id,
            player_id: null,
          },
          order: ctx.orm.sequelize.random(),
          limit: 5,
        });

        // Actualizamos la cantidad de cartas en mano
        player.num_hand_cards = initialCards.length;
        await player.save();

        // Realizamos la asignación de carta
        for (const card of initialCards) {
          card.player_id = player.id;
          card.deck_id = null;
          await card.save();
        }

        // Actualizamos la cantidad de cartas del mazo
        mazoPrincipal.num_cards -= initialCards.length;
        await mazoPrincipal.save();
      }

      // Agregamos una carta al azar al mazo de descarte
      const cartaDescarte = await ctx.orm.Card.findOne({
        where: {
          deck_id: mazoPrincipal.dataValues.id,
          player_id: null,
          type: "NumberCard",
        },
        include: [{ model: ctx.orm.NumberCard }],
        order: ctx.orm.sequelize.random(),
      });
      cartaDescarte.deck_id = mazoDescarte.dataValues.id;
      cartaDescarte.play_order = 1;
      await cartaDescarte.save();

      ctx.status = 201;
      ctx.body = {
        detail: "Partida creada exitosamente",
        partida,
        cartaInicial: {
          id: cartaDescarte.id,
          deck_id: cartaDescarte.deck_id,
          player_id: cartaDescarte.player_id,
          type: cartaDescarte.type,
          color: cartaDescarte.NumberCard.color,
          value: cartaDescarte.NumberCard.value,
        },
      };
    } else {
      ctx.status = 400;
      ctx.body = {
        detail: "Uno o más usuarios no existen",
      };
    }
  } catch (error) {
    ctx.body = { detail: JSON.stringify(error) };
    ctx.status = 400;
  }
});

// Función para obtener el mazo de descarte
router.get("partidas.deckDescarte", "/:gameId/descarte", async (ctx) => {
  try {
    const { gameId } = ctx.request.params;
    const mazoDescarte = await ctx.orm.Deck.findOne({
      where: { game_id: gameId },
      order: [["id", "ASC"]],
      offset: 1,
      limit: 1,
    });

    // Muestrame todas las cartas que han sido jugadas en el mazo de descarte

    const cartasDescarte = await ctx.orm.Card.findAll({
      where: { deck_id: mazoDescarte.dataValues.id },
      order: [["play_order", "DESC"]],
      include: [
        {
          model: ctx.orm.NumberCard,
          attributes: ["color", "value"],
        },
        {
          model: ctx.orm.ActionCard,
          attributes: ["color", "action"],
        },
      ],
      attributes: ["id", "type", "play_order", "player_id", "deck_id"],
    });

    const cartasDetalles = await Promise.all(
      cartasDescarte.map(async (card) => {
        if (card.type === "ActionCard") {
          const actionCard = await ctx.orm.ActionCard.findOne({
            where: { card_id: card.id },
          });

          return {
            id: card.id,
            type: card.type,
            color: actionCard.color,
            action: actionCard.action,
            player_id: card.player_id,
            deck_id: card.deck_id,
          };
        } else if (card.type === "NumberCard") {
          const numberCard = await ctx.orm.NumberCard.findOne({
            where: { card_id: card.id },
          });

          return {
            id: card.id,
            type: card.type,
            color: numberCard.color,
            value: numberCard.value,
            player_id: card.player_id,
            deck_id: card.deck_id,
          };
        }
      })
    );

    ctx.status = 200;

    ctx.body = {
      detail: "Mazo de descarte obtenido exitosamente",
      cartasMazoDescarte: cartasDetalles,
    };
  } catch (error) {
    ctx.throw(error);
    ctx.body = {
      detail: "No se pudo obtener el mazo de descarte, intente nuevamente",
    };
    ctx.status = 400;
  }
});

// Función obtener mano de un jugador
router.get("partidas.playerHand", "/:gameId/hand/:numPlayer", async (ctx) => {
  try {
    const { gameId } = ctx.request.params;
    const { numPlayer } = ctx.request.params;
    const player = await ctx.orm.Player.findOne({
      where: { game_id: gameId, num_player: numPlayer },
    });

    const cartasMano = await ctx.orm.Card.findAll({
      where: { player_id: player.dataValues.id, deck_id: null },
      include: [
        {
          model: ctx.orm.NumberCard,
          attributes: ["color", "value"],
        },
        {
          model: ctx.orm.ActionCard,
          attributes: ["color", "action"],
        },
      ],
      attributes: ["id", "type", "player_id", "deck_id"],
    });

    const cartasDetalles = await Promise.all(
      cartasMano.map(async (card) => {
        if (card.type === "ActionCard") {
          const actionCard = await ctx.orm.ActionCard.findOne({
            where: { card_id: card.id },
          });

          return {
            id: card.id,
            type: card.type,
            color: actionCard.color,
            action: actionCard.action,
            player_id: card.player_id,
            deck_id: card.deck_id,
          };
        } else if (card.type === "NumberCard") {
          const numberCard = await ctx.orm.NumberCard.findOne({
            where: { card_id: card.id },
          });

          return {
            id: card.id,
            type: card.type,
            color: numberCard.color,
            value: numberCard.value,
            player_id: card.player_id,
            deck_id: card.deck_id,
          };
        }
      })
    );

    ctx.status = 200;

    ctx.body = {
      detail: "Cartas de la mano obtenidas exitosamente",
      cartasMano: cartasDetalles,
    };
  } catch (error) {
    ctx.throw(error);
    ctx.body = {
      detail: "No se pudo obtener las cartas de la mano, intente nuevamente",
    };
    ctx.status = 400;
  }
});

// Endpoint para obtener el mazo principal
router.get("partidas.deckPrincipal", "/:gameId/mazoPrincipal", async (ctx) => {
  try {
    const { gameId } = ctx.request.params;
    const mazoPrincipal = await ctx.orm.Deck.findOne({
      where: { game_id: gameId },
      order: [["id", "ASC"]],
      limit: 1,
    });

    // Muestrame todas las cartas que están disponibles en el mazo principal

    const cartasPrincipal = await ctx.orm.Card.findAll({
      where: { deck_id: mazoPrincipal.dataValues.id },
      include: [
        {
          model: ctx.orm.NumberCard,
          attributes: ["color", "value"],
        },
        {
          model: ctx.orm.ActionCard,
          attributes: ["color", "action"],
        },
      ],
      attributes: ["id", "type", "player_id", "deck_id"],
    });

    const cartasDetalles = await Promise.all(
      cartasPrincipal.map(async (card) => {
        if (card.type === "ActionCard") {
          const actionCard = await ctx.orm.ActionCard.findOne({
            where: { card_id: card.id },
          });

          return {
            id: card.id,
            type: card.type,
            color: actionCard.color,
            action: actionCard.action,
            player_id: card.player_id,
            deck_id: card.deck_id,
          };
        } else if (card.type === "NumberCard") {
          const numberCard = await ctx.orm.NumberCard.findOne({
            where: { card_id: card.id },
          });

          return {
            id: card.id,
            type: card.type,
            color: numberCard.color,
            value: numberCard.value,
            player_id: card.player_id,
            deck_id: card.deck_id,
          };
        }
      })
    );

    ctx.status = 200;

    ctx.body = {
      detail: "Mazo principal obtenido exitosamente",
      cartasMazoPrincipal: cartasDetalles,
    };
  } catch (error) {
    ctx.throw(error);
    ctx.body = {
      detail: "No se pudo obtener el mazo principal, intente nuevamente",
    };
    ctx.status = 400;
  }
});

// Endpoint para obtener información de una carta
router.get("partidas.cardInfo", "/:gameId/cardInfo/:cardId", async (ctx) => {
  try {
    const { gameId } = ctx.request.params;
    const { cardId } = ctx.request.params;
    const carta = await ctx.orm.Card.findOne({
      where: { id: cardId },
      include: [
        {
          model: ctx.orm.NumberCard,
          attributes: ["color", "value"],
        },
        {
          model: ctx.orm.ActionCard,
          attributes: ["color", "action"],
        },
      ],
      attributes: ["id", "type", "player_id", "deck_id"],
    });

    if (carta.type === "ActionCard") {
      const actionCard = await ctx.orm.ActionCard.findOne({
        where: { card_id: carta.id },
      });

      ctx.body = {
        id: carta.id,
        type: carta.type,
        color: actionCard.color,
        action: actionCard.action,
        player_id: carta.player_id,
        deck_id: carta.deck_id,
      };
    } else if (carta.type === "NumberCard") {
      const numberCard = await ctx.orm.NumberCard.findOne({
        where: { card_id: carta.id },
      });

      ctx.body = {
        id: carta.id,
        type: carta.type,
        color: numberCard.color,
        value: numberCard.value,
        player_id: carta.player_id,
        deck_id: carta.deck_id,
      };
    }
  } catch (error) {
    ctx.throw(error);
    ctx.body = {
      detail:
        "No se pudo obtener la información de la carta, intente nuevamente",
    };
    ctx.status = 400;
  }
});

module.exports = router;
