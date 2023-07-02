const Router = require("koa-router");

const router = new Router();

const funciones = require("./utils/funciones");

const { turno, drawTwo, drawFourWild, newHand, fillDeck } = funciones;

// Pasar turno
router.post("games.turn", "/:gameId/turn", async (ctx) => {
  try {
    const game = await ctx.orm.Game.findOne({
      where: { id: ctx.request.params.gameId },
    });
    if (game) {
      if (game.active) {
        const player = await ctx.orm.Player.findOne({
          where: {
            user_id: ctx.request.body.user_id,
            game_id: ctx.request.params.gameId,
          },
        });
        if (player) {
          const jugador = player.num_player;
          if (game.current_player === jugador) {
            const nuevoTurno = await turno(
              ctx,
              ctx.request.params.gameId,
              false
            );
            game.current_player = nuevoTurno;
            await game.save();
            ctx.status = 201;
            ctx.body = {
              detail: "Turno pasado exitosamente",
            };
          } else {
            ctx.status = 403;
            ctx.body = {
              detail: "No es tu turno de jugar",
            };
          }
        } else {
          ctx.status = 404;
          ctx.body = {
            detail: "No se encontró el jugador",
          };
        }
      } else {
        ctx.status = 403;
        ctx.body = {
          detail: `Esta partida ya ha terminado, el ganador fue ${game.winner_player}`,
        };
      }
    } else {
      ctx.status = 404;
      ctx.body = {
        detail: "No se encontró la partida",
      };
    }
  } catch (error) {
    ctx.throw(error);
    ctx.body = {
      detail: "Ha ocurrido un problema pasando de turno, intentar nuevamente",
    };
    ctx.status = 400;
  }
});

// Sacar cartas
router.post("games.draw", "/:gameId/draw", async (ctx) => {
  try {
    const game = await ctx.orm.Game.findOne({
      where: { id: ctx.request.params.gameId },
    });
    if (game) {
      if (game.active) {
        const player = await ctx.orm.Player.findOne({
          where: {
            user_id: ctx.request.body.user_id,
            game_id: ctx.request.params.gameId,
          },
        });
        if (player) {
          const jugador = player.num_player;
          // Verificar que sea el turno del jugador
          if (game.current_player === jugador) {
            const mazoPrincipal = await ctx.orm.Deck.findOne({
              where: { game_id: ctx.request.params.gameId },
              order: [["id", "ASC"]],
              limit: 1,
            });
            // Buscamos una carta aleatoria del mazo principal
            const card = await ctx.orm.Card.findOne({
              where: {
                deck_id: mazoPrincipal.dataValues.id,
                player_id: null, // Que no haya sido asignada a un jugador anteriormente
              },
              order: ctx.orm.sequelize.random(),
            });

            // Asignar carta a jugador
            if (card) {
              await card.update({ player_id: jugador, deck_id: null });
              // Actualizar número de cartas en la mano
              player.num_hand_cards += 1;
              await player.save();

              // Actualizar número de cartas en el mazo
              mazoPrincipal.num_cards -= 1;
              await mazoPrincipal.save();

              // Para evitar que la función newHand falle, ya que la función
              // asigna 5 cartas al jugador desde el mazo principal.
              if (mazoPrincipal.num_cards < 5) {
                fillDeck(ctx, ctx.request.params.gameId);
              }
              // Queremos incluir toda la información relevante de la carta
              const idCarta = card.id;
              if (card.type === "ActionCard") {
                const actionCard = await ctx.orm.ActionCard.findOne({
                  where: { card_id: idCarta },
                });

                ctx.status = 201;
                ctx.body = {
                  detail: "Carta sacada exitosamente",
                  card: {
                    id: card.id,
                    type: card.type,
                    color: actionCard.color,
                    action: actionCard.action,
                    player_id: card.player_id,
                    deck_id: card.deck_id,
                  },
                };
              } else if (card.type === "NumberCard") {
                const numberCard = await ctx.orm.NumberCard.findOne({
                  where: { card_id: idCarta },
                });

                ctx.status = 201;
                ctx.body = {
                  detail: "Carta sacada exitosamente",
                  card: {
                    id: card.id,
                    type: card.type,
                    color: numberCard.color,
                    value: numberCard.value,
                    player_id: card.player_id,
                    deck_id: card.deck_id,
                  },
                };
              }
            }
          } else {
            ctx.status = 403; // Forbidden status
            ctx.body = {
              detail: "No es tu turno de jugar",
            };
          }
        } else {
          ctx.status = 404;
          ctx.body = {
            detail: "No se encontró el jugador",
          };
        }
      } else {
        ctx.status = 403;
        ctx.body = {
          detail: `Esta partida ya ha terminado, el ganador fue ${game.winner_player}`,
        };
      }
    } else {
      ctx.status = 404;
      ctx.body = {
        detail: "No se encontró la partida",
      };
    }
  } catch (error) {
    ctx.throw(error);
    ctx.body = {
      detail: "Ha ocurrido un problema sacando una carta, intentar nuevamente",
    };
    ctx.status = 400;
  }
});

// Jugar una carta
router.post("games.play", "/:gameId/play/:cardId", async (ctx) => {
  try {
    let jugadaValida = false;
    const game = await ctx.orm.Game.findOne({
      where: { id: ctx.request.params.gameId },
    });
    if (game) {
      if (game.active) {
        const player = await ctx.orm.Player.findOne({
          where: {
            user_id: ctx.request.body.user_id,
            game_id: ctx.request.params.gameId,
          },
        });
        if (player) {
          const jugador = player.num_player;

          if (game.current_player === jugador) {
            const mazoDescarte = await ctx.orm.Deck.findOne({
              where: { game_id: ctx.request.params.gameId },
              order: [["id", "ASC"]],
              offset: 1,
              limit: 1,
            });
            const card = await ctx.orm.Card.findOne({
              where: {
                id: ctx.request.params.cardId,
                deck_id: null,
                player_id: jugador,
              },
              include: [
                { model: ctx.orm.NumberCard },
                { model: ctx.orm.ActionCard },
              ],
            });

            // Verificar que la carta existe
            if (card) {
              // Encontrar la carta anteriormente jugada
              const cartaAnterior = await ctx.orm.Card.findOne({
                where: {
                  deck_id: mazoDescarte.dataValues.id,
                },
                order: [["play_order", "DESC"]],
                include: [
                  { model: ctx.orm.NumberCard },
                  { model: ctx.orm.ActionCard },
                ],
              });

              if (cartaAnterior) {
                // Verificar que la carta jugada coincida con el color o el número
                // de la carta judada previamente
                if (
                  card.type === "NumberCard" &&
                  cartaAnterior.type === "NumberCard" &&
                  (card.NumberCard.color === cartaAnterior.NumberCard.color ||
                    card.NumberCard.value === cartaAnterior.NumberCard.value)
                ) {
                  // La carta es válida para jugar
                  card.play_order = cartaAnterior.play_order + 1;
                  card.deck_id = mazoDescarte.dataValues.id;
                  card.player_id = null;
                  player.num_hand_cards -= 1;
                  const nuevoTurno = await turno(
                    ctx,
                    ctx.request.params.gameId,
                    false
                  );
                  game.current_player = nuevoTurno;
                  await card.save();
                  await player.save();
                  await game.save();
                  jugadaValida = true;
                } else if (
                  card.type === "ActionCard" &&
                  cartaAnterior.type === "ActionCard" &&
                  (card.ActionCard.color === cartaAnterior.ActionCard.color ||
                    card.ActionCard.action === cartaAnterior.ActionCard.action)
                ) {
                  // La carta es válida para jugar
                  card.play_order = cartaAnterior.play_order + 1;
                  card.deck_id = mazoDescarte.dataValues.id;
                  card.player_id = null;
                  player.num_hand_cards -= 1;
                  jugadaValida = true;
                  await card.save();
                  await player.save();

                  if (
                    card.type === "ActionCard" &&
                    card.ActionCard.action === "Skip"
                  ) {
                    const nuevoTurno = await turno(
                      ctx,
                      ctx.request.params.gameId,
                      true
                    );
                    game.current_player = nuevoTurno;
                    await game.save();
                  } else if (
                    card.type === "ActionCard" &&
                    card.ActionCard.action === "Reverse"
                  ) {
                    game.reverse = !game.reverse;
                    await game.save();
                    const nuevoTurno = await turno(
                      ctx,
                      ctx.request.params.gameId,
                      false
                    );
                    game.current_player = nuevoTurno;
                    await game.save();
                  } else if (
                    card.type === "ActionCard" &&
                    card.ActionCard.action === "Draw Two"
                  ) {
                    const siguienteJugador = await turno(
                      ctx,
                      ctx.request.params.gameId,
                      false
                    );

                    // El siguiente jugador debe robar 2 cartas y se salta
                    await drawTwo(
                      ctx,
                      ctx.request.params.gameId,
                      siguienteJugador
                    );
                    const nuevoTurno = await turno(
                      ctx,
                      ctx.request.params.gameId,
                      true
                    );
                    game.current_player = nuevoTurno;
                    await game.save();
                  } else if (
                    card.type === "ActionCard" &&
                    card.ActionCard.action === "Wild Draw Four"
                  ) {
                    if (ctx.request.body.color === undefined) {
                      ctx.status = 400;
                      ctx.body = {
                        detail:
                          "Debes especificar un color para la carta Wild Draw Four",
                      };
                      return;
                    }
                    card.ActionCard.color = ctx.request.body.color;
                    const siguienteJugador = await turno(
                      ctx,
                      ctx.request.params.gameId,
                      false
                    );

                    // El siguiente jugador debe robar 4 cartas y se salta su turno
                    await drawFourWild(
                      ctx,
                      ctx.request.params.gameId,
                      siguienteJugador
                    );
                    const nuevoTurno = await turno(
                      ctx,
                      ctx.request.params.gameId,
                      true
                    );
                    game.current_player = nuevoTurno;
                    await game.save();
                  } else if (
                    card.type === "ActionCard" &&
                    card.ActionCard.action === "Wild"
                  ) {
                    // Actualizamos el color de la carta Wild jugada
                    if (ctx.request.body.color === undefined) {
                      ctx.status = 400;
                      ctx.body = {
                        detail: "Debes especificar un color para la carta Wild",
                      };
                      return;
                    }
                    card.ActionCard.color = ctx.request.body.color;
                    card.play_order = cartaAnterior.play_order + 1;
                    card.deck_id = mazoDescarte.dataValues.id;
                    card.player_id = null;
                    player.num_hand_cards -= 1;
                    jugadaValida = true;
                    const nuevoTurno = await turno(
                      ctx,
                      ctx.request.params.gameId,
                      false
                    );
                    game.current_player = nuevoTurno;
                    await game.save();
                    await card.save();
                    await player.save();
                  }
                } else if (
                  card.type === "ActionCard" &&
                  cartaAnterior.type === "NumberCard" &&
                  card.ActionCard.color === cartaAnterior.NumberCard.color
                ) {
                  card.play_order = cartaAnterior.play_order + 1;
                  card.deck_id = mazoDescarte.dataValues.id;
                  card.player_id = null;
                  player.num_hand_cards -= 1;
                  jugadaValida = true;
                  await card.save();
                  await player.save();

                  if (
                    card.type === "ActionCard" &&
                    card.ActionCard.action === "Skip"
                  ) {
                    const nuevoTurno = await turno(
                      ctx,
                      ctx.request.params.gameId,
                      true
                    );
                    game.current_player = nuevoTurno;
                    await game.save();
                  } else if (
                    card.type === "ActionCard" &&
                    card.ActionCard.action === "Reverse"
                  ) {
                    game.reverse = !game.reverse;
                    await game.save();
                    const nuevoTurno = await turno(
                      ctx,
                      ctx.request.params.gameId,
                      false
                    );
                    game.current_player = nuevoTurno;
                    await game.save();
                  } else if (
                    card.type === "ActionCard" &&
                    card.ActionCard.action === "Draw Two"
                  ) {
                    const siguienteJugador = await turno(
                      ctx,
                      ctx.request.params.gameId,
                      false
                    );

                    await drawTwo(
                      ctx,
                      ctx.request.params.gameId,
                      siguienteJugador
                    );
                    const nuevoTurno = await turno(
                      ctx,
                      ctx.request.params.gameId,
                      true
                    );
                    game.current_player = nuevoTurno;
                    await game.save();
                  } else if (
                    card.type === "ActionCard" &&
                    card.ActionCard.action === "Wild Draw Four"
                  ) {
                    if (ctx.request.body.color === undefined) {
                      ctx.status = 400;
                      ctx.body = {
                        detail:
                          "Debes especificar un color para la carta Wild Draw Four",
                      };
                      return;
                    }
                    card.ActionCard.color = ctx.request.body.color;
                    const siguienteJugador = await turno(
                      ctx,
                      ctx.request.params.gameId,
                      false
                    );

                    // El siguiente jugador debe robar 4 cartas y se salta su turno
                    await drawFourWild(
                      ctx,
                      ctx.request.params.gameId,
                      siguienteJugador
                    );
                    const nuevoTurno = await turno(
                      ctx,
                      ctx.request.params.gameId,
                      true
                    );
                    game.current_player = nuevoTurno;
                    await game.save();
                  }
                } else if (
                  card.type === "NumberCard" &&
                  cartaAnterior.type === "ActionCard" &&
                  card.NumberCard.color === cartaAnterior.ActionCard.color
                ) {
                  card.play_order = cartaAnterior.play_order + 1;
                  card.deck_id = mazoDescarte.dataValues.id;
                  card.player_id = null;
                  player.num_hand_cards -= 1;
                  jugadaValida = true;
                  await card.save();
                  await player.save();

                  const nuevoTurno = await turno(
                    ctx,
                    ctx.request.params.gameId,
                    false
                  );
                  game.current_player = nuevoTurno;
                  await game.save();
                  await player.save();
                  await card.save();
                } else if (
                  card.type === "ActionCard" &&
                  card.ActionCard.action === "Wild"
                ) {
                  // La carta Wild puede ser jugada sin importar el color de la carta anterior
                  if (ctx.request.body.color === undefined) {
                    ctx.status = 400;
                    ctx.body = {
                      detail: "Debes especificar un color para la carta Wild",
                    };
                    return;
                  }

                  card.ActionCard.color = ctx.request.body.color;
                  card.play_order = cartaAnterior.play_order + 1;
                  card.deck_id = mazoDescarte.dataValues.id;
                  card.player_id = null;
                  player.num_hand_cards -= 1;
                  jugadaValida = true;
                  await card.ActionCard.save();
                  await card.save();
                  await player.save();
                  const nuevoTurno = await turno(
                    ctx,
                    ctx.request.params.gameId,
                    false
                  );
                  game.current_player = nuevoTurno;
                  await game.save();
                } else if (
                  card.type === "ActionCard" &&
                  card.ActionCard.action === "Wild Draw Four"
                ) {
                  // La carta Wild Draw Four puede ser jugada en cualquier momento
                  if (ctx.request.body.color === undefined) {
                    ctx.status = 400;
                    ctx.body = {
                      detail:
                        "Debes especificar un color para la carta Wild Draw Four",
                    };
                    return;
                  }
                  card.ActionCard.color = ctx.request.body.color;
                  card.play_order = cartaAnterior.play_order + 1;
                  card.deck_id = mazoDescarte.dataValues.id;
                  card.player_id = null;
                  player.num_hand_cards -= 1;
                  jugadaValida = true;
                  await card.ActionCard.save();
                  await card.save();
                  await player.save();

                  const siguienteJugador = await turno(
                    ctx,
                    ctx.request.params.gameId,
                    false
                  );

                  // El siguiente jugador debe robar 4 cartas y se salta su turno
                  await drawFourWild(
                    ctx,
                    ctx.request.params.gameId,
                    siguienteJugador
                  );
                  const nuevoTurno = await turno(
                    ctx,
                    ctx.request.params.gameId,
                    true
                  );
                  game.current_player = nuevoTurno;
                  await game.save();
                } else {
                  // La carta no es válida para jugar
                  ctx.status = 403;
                  ctx.body = {
                    detail: "La carta no es válida para jugar, prueba con otra",
                  };
                }
              } else {
                // No hay carta previa, la primera puede ser jugada. No creo que este caso sea
                // posible debido a la manera en que modelamos la creación de una partida, pero
                // lo dejo por si acaso.
                card.play_order = 1;
                card.deck_id = mazoDescarte.dataValues.id;
                card.player_id = null;
                player.num_hand_cards -= 1;
                game.current_player =
                  (game.current_player % game.num_players) + 1;
                await card.save();
                await player.save();
                await game.save();
                ctx.status = 201;
              }
              if (jugadaValida) {
                if (player.num_hand_cards === 0) {
                  player.victory_points += 1;
                  if (player.victory_points === 3) {
                    game.winner_player = player.num_player;
                    game.active = false;
                  } else {
                    newHand(ctx, game.id, player.num_player);
                  }
                }
                await card.save();
                await player.save();
                await game.save();
                ctx.status = 201;
                // Queremos incluir toda la información relevante de la carta
                const idCarta = card.id;
                if (card.type === "ActionCard") {
                  const actionCard = await ctx.orm.ActionCard.findOne({
                    where: { card_id: idCarta },
                  });
                  ctx.body = {
                    detail: "Carta jugada exitosamente",
                    card: {
                      id: card.id,
                      type: card.type,
                      color: actionCard.color,
                      action: actionCard.action,
                    },
                  };
                } else if (card.type === "NumberCard") {
                  const numberCard = await ctx.orm.NumberCard.findOne({
                    where: { card_id: idCarta },
                  });
                  ctx.body = {
                    detail: "Carta jugada exitosamente",
                    card: {
                      id: card.id,
                      type: card.type,
                      color: numberCard.color,
                      value: numberCard.value,
                    },
                  };
                }
              }
            } else {
              // La carta no existe
              ctx.status = 404;
              ctx.body = {
                detail: "No tienes esta carta en tu mano",
              };
            }
          } else {
            ctx.status = 403;
            ctx.body = {
              detail: "No es tu turno de jugar",
            };
          }
        } else {
          ctx.status = 404;
          ctx.body = {
            detail: "No se encontró al jugador en esta partida",
          };
        }
      } else {
        ctx.status = 403;
        ctx.body = {
          detail: `Esta partida ya ha terminado, el ganador fue ${game.winner_player}`,
        };
      }
    } else {
      ctx.status = 404;
      ctx.body = {
        detail: "No se encontró la partida",
      };
    }
  } catch (error) {
    ctx.throw(error);
    ctx.body = {
      detail: "Ha ocurrido un problema jugando una carta, intentar nuevamente",
    };
    ctx.status = 400;
  }
});

// Ver si la carta es válida para jugar, pero que no se juegue
router.post("games.check", "/:gameId/check/:cardId", async (ctx) => {
  try {
    console.log("Verificando carta...");
  } catch (error) {
    ctx.throw(error);
    ctx.body = {
      detail:
        "Ha ocurrido un problema verificando una carta, intentar nuevamente",
    };
    ctx.status = 400;
  }
});

module.exports = router;
