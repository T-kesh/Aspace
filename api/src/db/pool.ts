import pg from "pg";
import { env } from "../config/env.js";

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000
});

export async function testDatabaseConnection() {
  const result = await pool.query<{ now: Date }>("SELECT NOW() AS now");
  return result.rows[0];
}
