import { Sequelize } from "sequelize";
import pg from "pg";
import "dotenv/config";

let sequelize;

// --------------------------------------------------
// PRODUCTION / NEON DATABASE
// --------------------------------------------------

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",

    // Important for Vercel
    dialectModule: pg,

    logging: false,

    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
}

// --------------------------------------------------
// LOCAL POSTGRES DATABASE
// --------------------------------------------------
else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,

      port: Number(process.env.DB_PORT),

      dialect: "postgres",

      // Important
      dialectModule: pg,

      logging: false,
    },
  );
}

export default sequelize;
