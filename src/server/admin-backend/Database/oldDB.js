import mysql from 'mysql2';

const globalKey = '__khudiiDbPool';

function createPool() {
  const host = process.env.DB_HOST || process.env.DATABASE_HOST;
  const user = process.env.DB_USER || process.env.DATABASE_USER;
  const password = process.env.DB_PASSWORD || process.env.DB_PASS || process.env.DATABASE_PASSWORD;
  const database = process.env.DB_NAME || process.env.DATABASE_NAME;
  const port = Number(process.env.DB_PORT || process.env.DATABASE_PORT || 3306);

  if (!host || !user || !database) {
    console.warn('Khudii database environment variables are incomplete.');
  }

  const pool = mysql.createPool({
    host,
    user,
    password,
    database,
    port,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    maxIdle: Number(process.env.DB_MAX_IDLE || 5),
    idleTimeout: Number(process.env.DB_IDLE_TIMEOUT || 30000),
    queueLimit: Number(process.env.DB_QUEUE_LIMIT || 0),
    enableKeepAlive: true,
    keepAliveInitialDelay: 5000,
    connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT || 10000),
    multipleStatements: false,
    ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true' },
  });

  // Handle pool-level connection errors gracefully
  pool.on('error', (err) => {
    console.error('MySQL Admin Pool Error:', err);
  });

  return pool;
}

const db = globalThis[globalKey] || createPool();
globalThis[globalKey] = db;

export default db;
