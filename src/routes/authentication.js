const Router = require("koa-router");
var jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

dotenv.config();

const router = new Router();

// Esta request sirve para crear un usuario
router.post("authentication.signup", "/signup", async (ctx) => {
  const authInfo = ctx.request.body;
  let user = await ctx.orm.User.findOne({ where: { mail: authInfo.email } });
  if (user) {
    ctx.body = `El usuario ${authInfo.email} ya existe`;
    ctx.status = 400;
    return;
  }
  try {
    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(authInfo.password, saltRounds);
    user = await ctx.orm.User.create({
      username: authInfo.username,
      mail: authInfo.email,
      password: hashPassword,
    });
  } catch (error) {
    ctx.body = error;
    ctx.status = 400;
    return;
  }
  ctx.body = {
    username: user.username,
    email: user.mail,
  };
  ctx.status = 201;
});

router.post("authentication.login", "/login", async (ctx) => {
  let user;
  const authInfo = ctx.request.body;
  try {
    user = await ctx.orm.User.findOne({ where: { mail: authInfo.email } });
  } catch (error) {
    ctx.body = error;
    ctx.status = 400;
    return;
  }
  if (!user) {
    ctx.body = `El usuario ${authInfo.email} no existe`;
    ctx.status = 400;
    return;
  }
  const validPassword = await bcrypt.compare(authInfo.password, user.password);
  if (validPassword) {
    // Generamos el token JWT
    const expirationSeconds = 1 * 60 * 60 * 24; // 1 día en segundos
    const JWT_PRIVATE_KEY = process.env.JWT_SECRET;
    const tokenPayload = {
      id: user.id,
      username: user.username, // Incluimos el username en el payload del token
      mail: user.mail,
      scope: ["user"],
    };
    const token = jwt.sign(tokenPayload, JWT_PRIVATE_KEY, {
      subject: user.id.toString(),
      expiresIn: expirationSeconds,
    });

    ctx.body = {
      access_token: token,
      token_type: "Bearer",
      expires_in: expirationSeconds,
    };
    ctx.status = 200;
  } else {
    ctx.body = `La contraseña es incorrecta`;
    ctx.status = 400;
    return;
  }
});

module.exports = router;
