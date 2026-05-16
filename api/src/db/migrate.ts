import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./pool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationPath = path.resolve(__dirname, "../../sql/001_init.sql");

export async function migrateDatabase() {
  const sql = await readFile(migrationPath, "utf8");
  await pool.query(sql);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrateDatabase()
    .then(() => {
      console.log("Database migration completed.");
    })
    .catch((error) => {
      console.error("Database migration failed.");
      console.error(error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await pool.end();
    });
}
