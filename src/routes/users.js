const Router = require("koa-router");

const router = new Router();

// Listar todos los usuarios
router.get("users.list", "/", async (ctx) => {
  try {
    const users = await ctx.orm.User.findAll();
    ctx.body = users;
    ctx.status = 200;
  } catch (error) {
    ctx.body = error;
    ctx.status = 400;
  }
});

// Encontrar un usuario por id
router.get("users.show", "/:id", async (ctx) => {
  try {
    const users = await ctx.orm.User.findOne({ where: { id: ctx.params.id } });
    ctx.body = users;
    ctx.status = 200;
  } catch (error) {
    ctx.body = error;
    ctx.status = 400;
  }
});

// Encontrar un usuario por username
router.get("users.show", "/username/:username", async (ctx) => {
  try {
    const users = await ctx.orm.User.findOne({
      where: { username: ctx.params.username },
    });
    ctx.body = users;
    ctx.status = 200;
  } catch (error) {
    ctx.body = error;
    ctx.status = 400;
  }
});

module.exports = router;
