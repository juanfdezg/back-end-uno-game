const bcrypt = require("bcrypt");

module.exports = {
  up: async (queryInterface) => {
    const users = [
      {
        username: "juanfernandez",
        password: "abc1234%",
        mail: "jfernaandez@uc.cl",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "paulmacguire",
        password: "hij786$",
        mail: "paul.macguire@uc.cl",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "fernandosmith",
        password: "pa$$w0rd1",
        mail: "fsmith@dcc.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "antonioossa",
        password: "passw0rd2!",
        mail: "aossa@dcc.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "user5",
        password: "MyP@ssw0rd3",
        mail: "user5@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "user6",
        password: "passw0rd4*",
        mail: "user6@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "user7",
        password: "pa$$w0rd5?",
        mail: "user7@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "user8",
        password: "password6@",
        mail: "user8@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "user9",
        password: "Pa$$w0rd7",
        mail: "user9@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "user10",
        password: "p@ssW0rd8",
        mail: "user10@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const saltRounds = 10;

    // Hasheamos las contraseñas de los usuarios
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const hashPassword = await bcrypt.hash(user.password, saltRounds);
        return {
          ...user,
          password: hashPassword,
        };
      })
    );

    return queryInterface.bulkInsert("Users", hashedUsers, {});
  },

  down: (queryInterface) => queryInterface.bulkDelete("Users", null, {}),
};