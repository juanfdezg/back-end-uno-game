const Router = require('koa-router');
const rules = require('./routes/rules');
const users = require('./routes/users');
const partidas = require('./routes/partidas');
const juego = require('./routes/juego');
const jugadores = require('./routes/jugadores');
const authRoutes = require('./routes/authentication');
const jwtMiddleware = require('koa-jwt');
const dotenv = require('dotenv');
const scopeProtectedRoutes = require('./routes/scopeUsers');

dotenv.config();

const router = new Router();

router.use('/rules', rules.routes());
router.use('/partidas', partidas.routes());
router.use('/juego', juego.routes());
router.use('/jugadores', jugadores.routes());
router.use(authRoutes.routes());

// Desde esta línea, todas las rutas requerirán un JWT. Esto no aplica para las lineas anteriores.
router.use(jwtMiddleware({ secret: process.env.JWT_SECRET }));

router.use('/users', users.routes());
router.use('/scope-users', scopeProtectedRoutes.routes());
router.use()


module.exports = router;
