require("dotenv").load();

module.exports = {
    development: {
        client: "postgresql",
        connection: {
            database: process.env.DATABASE_NAME,
            user:     process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD
        }
    },
    production: {
        client: "postgresql",
        connection: process.env.DATABASE_URL
    }
};
