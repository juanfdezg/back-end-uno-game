# IIC2513 - Tecnologías y Aplicaciones Web

# Entrega 2 Proyecto: Backend

## UNO Wild Card Game

Este proyecto consiste en el desarrollo del backend del juego UNO Wild Card Game, el cual está
basado en el popular juego de cartas UNO. El objetivo es proporcionar una API que permita a los
usuarios jugar partidas interactivas de UNO Wild. Para probar la aplicación ingresar al siguiente 
link ([UNO Wild Card Game](https://main--reliable-profiterole-b8a305.netlify.app/)). En este [repositorio](https://github.com/juanfdezg/front-end-uno-game) puedes encontrar el código para el Frontend.

## Características principales

- Creación y gestión de partidas de UNO Wild.
- Asignación de cartas a los jugadores.
- Implementación de las reglas del juego, como jugar cartas, robar cartas, cambiar
  de turno, etc.
- Manejo de eventos especiales del juego, como cartas especiales y cambios de color.
- Sistema de puntuación para determinar el ganador de cada partida.

# Documentación de la API

La API ofrece endpoints que permiten a los usuarios realizar acciones como unirse a una partida,
jugar o robar una carta, pasar de turno, ver el estado de la partida y obtener información sobre las
cartas disponibles. Para acceder a la documentación completa de la API, puedes ingresar a
la siguiente [colección de Postman](https://documenter.getpostman.com/view/27784793/2s93sW9FiY).

## Estructura

El proyecto sigue la siguiente estructura de directorios y archivos:

<pre>
.
├── README.md
├── docs
│   └── ER_Diagram.drawio.png
├── package.json
├── src
│   ├── app.js
│   ├── config
│   │   └── config.js
│   ├── index.js
│   ├── migrations
│   │   ├── 20230531015550-create-user.js
│   │   ├── 20230531015704-create-game.js
│   │   ├── 20230531015912-create-player.js
│   │   ├── 20230531020008-create-board.js
│   │   ├── 20230531031524-create-deck.js
│   │   ├── 20230531031558-create-card.js
│   │   ├── 20230531031706-create-action-card.js
│   │   ├── 20230531031721-create-number-card.js
│   │   └── 20230531031731-create-special-card.js
│   ├── models
│   │   ├── actioncard.js
│   │   ├── board.js
│   │   ├── card.js
│   │   ├── deck.js
│   │   ├── game.js
│   │   ├── index.js
│   │   ├── numbercard.js
│   │   ├── player.js
│   │   ├── specialcard.js
│   │   └── user.js
│   ├── routes
│   │   ├── juego.js
│   │   ├── jugadores.js
│   │   ├── partidas.js
│   │   ├── rules.js
│   │   ├── users.js
│   │   └── utils
│   │       └── funciones.js
│   ├── routes.js
│   └── seeders
│       └── 20230530150036-seed-users.js
└── yarn.lock
</pre>

# Pasos a seguir para la creación de la Database:

1. Se tienen que instalar todas las dependencias asociadas:
<pre>
    apt install postgresql postgresql-contrib
</pre>

2. Correr servidores de **Postgres (psql)**:
<pre>
    sudo service postgresql start
</pre>

3. Crear usuario asociado al archivo **.env**:
<pre>
    sudo -u postgres createuser -superuser grupo_daltonicos
</pre>

4. Crear la base de datos asociada al archivo **.env**:
<pre>
    sudo -u postgres createdb uno_game_db_development
    sudo -u postgres createdb uno_game_db_test
    sudo -u postgres createdb uno_game_db_production
</pre>

5. Se tiene que ingresar a **Postgres** (psql):
<pre>
    sudo -u postgres psql
</pre>

6. Se tiene que cambiar la contraseña del usuario creado en el paso 3, esto se tiene que hacer dentro de **Postgres**:
<pre>
    ALTER USER grupo_daltonicos WITH PASSWORD 'grupo_daltonicos';
</pre>

7. Se tiene que conectar la Database con el usuario creado:
<pre>
    psql -U grupo_daltonicos -d uno_game_db_development -h 127.0.0.1
    psql -U grupo_daltonicos -d uno_game_db_test -h 127.0.0.1
    psql -U grupo_daltonicos -d uno_game_db_production -h 127.0.0.1
</pre>

8. En caso de tener problemas, se puede revisar el archivo **pg_hba.conf**:
<pre>
    sudo nano /etc/postgresql/12/main/pg_hba.conf
</pre>

- Para más información, se puede consultar el siguiente [link](https://itslinuxfoss.com/fix-postgresql-password-authentication-failed-for-user/).

# Pasos a seguir para crear modelos y correr las migraciones:

1. Crear el modelo ( _NOMBRE_MODELO_ la primera letra tiene que ser en mayúscula):
<pre>
    yarn sequilize-cli model:generate --name NOMBRE_MODELO 
    --attributes atr1:tipo,atr2:tipo,atr3:tipo
</pre>

2. Correr las migraciones:
<pre>
    yarn sequelize-cli db:migrate
</pre>

3. Crear las semillas ( _NOMBRE_MODELO_ la primera letra **no** tiene que ser en mayúscula):
<pre>
    yarn sequelize-cli seed:generate --name seed-NOMBRE_MODELOs
</pre>

4. Poblar todas las seeds en base a las instancias creadas en `/seeders`.

5. Correr las migraciones de TODAS las seeds.
<pre>
    yarn sequelize-cli db:seed:all
</pre>

6. Si queremos revisar las tablas en postgres:
<pre>
    psql unogame_db_development
    \dt
</pre>

7. Si queremos revisar todas nuestras databases:
<pre>
    \l
</pre>

# Para ejecutar la API:

1. Instalar las dependencias:
<pre>
    yarn install
</pre>

2. Iniciar el servidor:
<pre>
    yarn dev
</pre>

# Fuentes de ayuda y Recursos Utilizados

Para la realización de este proyecto, fueron de ayuda las cápsulas y el material del curso
"Tecnologías y Aplicaciones Web". Para obtener información técnica más detallada sobre las
tecnologías utilizadas, se consultó la documentación en línea proporcionada por
[DevDocs API Documentation](https://devdocs.io/). También fue de ayuda ChatGPT y GitHub Copilot
para la resolución de dudas y mejorar la eficiencia y precisión en el desarrollo del código.

Se utilizó ESLint para mantener la consistencia y calidad del código, aplicando reglas y
convenciones de estilo de Airbnb. Esto ayudó a identificar y corregir posibles errores o
malas prácticas en el código.
