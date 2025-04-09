// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
import 'dotenv/config'; // Ensure env variables are loaded

// Explicitly load .env.local for consistency, though 'dotenv/config' might suffice
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Fetch the direct connection URL from environment variables
const connectionString = process.env.POSTGRES_URL_NON_POOLING;

if (!connectionString) {
  throw new Error(
    '🔴 Missing POSTGRES_URL_NON_POOLING environment variable for Drizzle Kit config.'
  );
}

export default defineConfig({
  dialect: 'postgresql', // 'postgresql' for Supabase
  schema: './lib/db/schema.ts',
  out: './db/migrations',
  dbCredentials: {
    // Using PostgreSQL connection format
    url: connectionString,
  },
  // Optional: Filter Supabase internal schemas
  // tablesFilter: ["!auth.*", "!storage.*", ...],
  verbose: true,
  strict: true,
});
