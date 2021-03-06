const config = require("./config");

const connectDb = () =>
  require("knex")({
    client: "pg",
    connection: {
      host: config.postgresHost,
      user: config.postgresUsername,
      password: config.postgresPassword,
      database: config.postgresDatabase,
    },
  });

// Clean db
const cleanDb = async () => {
  const knex = connectDb();
  await knex.raw(`
    DO $$ DECLARE
        r RECORD;
    BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
            EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
    END $$;
  `);
  await knex.destroy();
};

module.exports = {
  connectDb,
  cleanDb,
};
