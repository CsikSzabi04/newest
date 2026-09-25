import mysql from 'mysql2/promise'
import { config } from './config.js'

// dateStrings: a DATETIME nyersen, 'YYYY-MM-DD HH:mm:ss' alakban jön vissza.
// Így nincs időzóna-csúszás a Pi, a MySQL és a böngésző között.
export const pool = mysql.createPool({
  ...config.db,
  dateStrings: true,
  waitForConnections: true,
  connectionLimit: 5,
  enableKeepAlive: true
})

export async function ping() {
  const conn = await pool.getConnection()
  try {
    await conn.ping()
  } finally {
    conn.release()
  }
}
