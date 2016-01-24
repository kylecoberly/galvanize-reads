require("dotenv").load();

var configuration = {
    client: "postgresql",
    connection: {
        database: process.env.DATABASE_NAME,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD
    } || process.env.DATABASE_URL
};

module.exports = require("knex")(configuration);
