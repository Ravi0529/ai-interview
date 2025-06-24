import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

async function main() {
  try {
    console.log("Connected to DB");
  } catch (error) {
    console.error("DB connection failed:", error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}
