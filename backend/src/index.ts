import { app } from "./app.js";
import { env } from "./config/env.js";
import { migrateDatabase } from "./db/migrate.js";
import { pool } from "./db/pool.js";

try {
  await migrateDatabase();
  console.log("Database migration completed.");
} catch (error) {
  console.warn("Database migration skipped. Backend will use the local fallback agent store until Postgres is available.");
  console.warn(error);
}

const server = app.listen(env.API_PORT, () => {
  console.log(`Aspace API listening on http://localhost:${env.API_PORT}${env.API_BASE_PATH}`);
});

async function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
