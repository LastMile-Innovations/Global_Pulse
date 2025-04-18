import postgres from "postgres";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config({ path: ".env.local" });

const url = process.env.POSTGRES_URL_NON_POOLING!;
if (!url) throw new Error("Missing POSTGRES_URL_NON_POOLING");

const sql = postgres(url, { ssl: "require" });

async function dropAllTables() {
  // Drop all tables in public schema
  const tables = await sql<{
    tablename: string;
  }[]>`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;
  for (const { tablename } of tables) {
    await sql.unsafe(`DROP TABLE IF EXISTS "${tablename}" CASCADE;`);
  }
  // Drop Drizzle migration table if it exists
  await sql.unsafe('DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE;');
  await sql.end();
  console.log("✅ All tables dropped.");
}

function askConfirmation(): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(
      "⚠️  This will DROP ALL TABLES in your database. Are you sure? (y/N): ",
      (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === "y");
      }
    );
  });
}

(async () => {
  const confirmed = await askConfirmation();
  if (confirmed) {
    await dropAllTables();
  } else {
    console.log("❌ Aborted. No tables were dropped.");
    process.exit(0);
  }
})();