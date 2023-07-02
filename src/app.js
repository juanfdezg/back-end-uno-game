const Koa = require("koa");
const koaBody = require("koa-body");
const KoaLogger = require("koa-logger");
const cors = require("@koa/cors");
const router = require("./routes");
const orm = require("./models");

// Crear instancia de Koa
const app = new Koa();

app.context.orm = orm;
app.use(cors());

// Middlewares proporcionados por Koa
app.use(KoaLogger());
app.use(koaBody());
// Middlewares personalizados. Encargado de dar respuesta "Hola Mundo"
app.use(async (ctx, next) => {
  // Verificar si la ruta coincide con alguna ruta definida en el enrutador
  const matchedRoute = router.match(ctx.path, ctx.method);
  //   console.log(matchedRoute);

  if (!matchedRoute) {
    // La ruta no coincide, responder con " hola IIC2513"
    ctx.body = " hola IIC2513";
  } else {
    // La ruta coincide, continuar con el siguiente middleware

    await next();
  }
});

// koa-router
app.use(router.routes());

// Hacer que el servidor escuche en el puerto 3000
// app.listen(3000, () => {
//   console.log("Iniciando app en el puerto 3000");
// });

module.exports = app;