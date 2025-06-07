const { Pool } = require('pg');

/*
 * This module exports a function to initialize the database connection pool and ensure the target database and schema exist.
 * It also provides a query function to execute SQL queries against the application pool.
 * The admin pool is used only for initial setup and is not exposed outside this module.
 */

/** COMMENT OUT THIS BLOCK AND UNCOMMENT THE BELOW BLOCK TO USE AT ECS*/
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/tododb',
});

async function init() {
  await pool.query(`CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT false
  )`);
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  init,
};


/*
    * Database connection pool for a PostgreSQL database.
    * This module initializes the connection pool and ensures the target database and schema exist.
    * It uses environment variables for configuration.
*/

/**** UNCOMMENT THIS BLOCK IF YOU WANT TO DEPLOY TO ECS
const {
  DB_HOST,
  DB_PORT = 5432,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_ADMIN_DB = 'postgres',
  DB_SSL,
} = process.env;

const ssl = {
  rejectUnauthorized: false // For RDS; skip cert validation
};

// Admin pool: used to create the database if it doesn't exist
const adminPool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_ADMIN_DB,
  ssl: DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// App pool: used for all application queries
let appPool;

module.exports = {
  init: async () => {
    // Try to create the target database if not exists
    const result = await adminPool.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [DB_NAME]);
    if (result.rowCount === 0) {
      console.log(`Database "${DB_NAME}" not found. Creating...`);
      await adminPool.query(`CREATE DATABASE ${DB_NAME}`);
      console.log(`Database "${DB_NAME}" created.`);
    }

    // Initialize application pool
    appPool = new Pool({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      ssl
    });

    // Create table if not exists
    await appPool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE
      )
    `);

    console.log('Connected to database and ensured schema is initialized.');
  },

  query: (text, params) => appPool.query(text, params),
};
************/
