import mysql from 'mysql2/promise';
import mysqlEscape from 'mysql2';

// Export-only database support. Cross-environment synchronization is intentionally absent.
const identifier = value => {
  if (!/^[A-Za-z0-9_]+$/.test(String(value || ''))) throw new Error('Invalid database identifier');
  return `\`${value}\``;
};
const enabled = value => String(value || '').toLowerCase() === 'true';

export function databaseConfig() {
  const env = process.env;
  const host = env.DB_LIVE_HOST || env.DB_HOST || env.DATABASE_HOST;
  const user = env.DB_LIVE_USER || env.DB_USER || env.DATABASE_USER;
  const password = env.DB_LIVE_PASSWORD || env.DB_PASSWORD || env.DB_PASS || env.DATABASE_PASSWORD;
  const database = env.DB_LIVE_NAME || env.DB_NAME || env.DATABASE_NAME;
  const port = Number(env.DB_LIVE_PORT || env.DB_PORT || env.DATABASE_PORT || 3306);
  if (!host || !user || !database || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Live database connection is not configured');
  }
  return {
    host, user, password, database, port, multipleStatements:false,
    connectTimeout:10000, timezone:'Z',
    ssl: enabled(env.DB_LIVE_SSL ?? env.DB_SSL)
      ? {rejectUnauthorized: !enabled(env.DB_LIVE_SSL_INSECURE)} : undefined,
  };
}
const connect = () => mysql.createConnection(databaseConfig());
async function tableNames(connection) {
  const [rows] = await connection.query('SHOW FULL TABLES WHERE Table_type = ?', ['BASE TABLE']);
  return rows.map(row => String(Object.values(row)[0])).sort();
}
async function columns(connection, table) {
  const [rows] = await connection.query(`SHOW COLUMNS FROM ${identifier(table)}`);
  return rows.map(row => String(row.Field));
}
async function createSql(connection, table) {
  const [[row]] = await connection.query(`SHOW CREATE TABLE ${identifier(table)}`);
  return row['Create Table'];
}
export async function getDatabaseStatus() {
  const result={export:{available:false}};
  let connection;
  try {
    connection=await connect();
    result.export={available:true,tables:(await tableNames(connection)).length};
  } catch(error) {result.export.error=error.message;}
  finally {await connection?.end().catch(()=>{});}
  return result;
}
export async function exportLiveDatabase() {
  const connection=await connect();
  const encoder=new TextEncoder();
  let closed=false;
  async function* dump() {
    try {
      await connection.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
      await connection.query('START TRANSACTION WITH CONSISTENT SNAPSHOT');
      yield 'SET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS=0;\n';
      for(const table of await tableNames(connection)) {
        yield `${await createSql(connection,table)};\n`;
        const fields=await columns(connection,table);
        for(let offset=0;;) {
          const [rows]=await connection.query(`SELECT * FROM ${identifier(table)} LIMIT 150 OFFSET ?`,[offset]);
          if(!rows.length)break;
          for(const row of rows) {
            const values=fields.map(column=>mysqlEscape.escape(row[column]));
            yield `INSERT INTO ${identifier(table)} (${fields.map(identifier).join(',')}) VALUES (${values.join(',')});\n`;
          }
          offset+=rows.length;
        }
      }
      yield 'SET FOREIGN_KEY_CHECKS=1;\n';
    } finally {
      if(!closed){closed=true;await connection.query('ROLLBACK').catch(()=>{});await connection.end().catch(()=>{});}
    }
  }
  const iterator=dump();
  return new ReadableStream({
    async pull(controller){
      try{const {value,done}=await iterator.next();if(done)controller.close();else controller.enqueue(encoder.encode(value));}
      catch(error){controller.error(error);}
    },
    async cancel(){await iterator.return?.();},
  });
}
