import { Pool } from "pg";
import { readFile } from "node:fs/promises";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required for migrations.");
  process.exitCode = 1;
} else {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 10000 });
  try {
    const sql = await readFile(new URL("./schema.sql", import.meta.url), "utf8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("COMMIT");
      console.info("PostgreSQL pgvector schema initialized.");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
