// lib/db/migrate.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Explicitly load .env.local
dotenv.config({ path: '.env.local' });

async function runMigrations() {
  // IMPORTANT: Use the DIRECT connection string for migrations
  const migrationDbUrl = process.env.POSTGRES_URL_NON_POOLING;
  if (!migrationDbUrl) {
    throw new Error(
      ' Missing POSTGRES_URL_NON_POOLING environment variable. Cannot apply migrations.'
    );
  }

  console.log(' Applying migrations...');

  // Use max: 1 for migrations as required by postgres-js for transactional safety
  const migrationClient = postgres(migrationDbUrl, { max: 1 });
  const migrationDb = drizzle(migrationClient);

  try {
    await migrate(migrationDb, { migrationsFolder: './db/migrations' });
    console.log(' Migrations applied successfully!');
  } catch (error) {
    console.error(' Error applying migrations:', error);
    process.exit(1); // Exit with error code
  } finally {
    console.log(' Closing migration connection.');
    await migrationClient.end(); // Ensure the connection is closed
  }
}

runMigrations();
