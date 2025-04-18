import { defineConfig } from 'drizzle-kit';
import 'dotenv/config'; // Ensure env variables are loaded

// Explicitly load .env.local for consistency, though 'dotenv/config' might suffice
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Fetch the direct connection URL from environment variables
const url = process.env.POSTGRES_URL_NON_POOLING;

if (!url) {
  throw new Error(
    '🔴 Missing POSTGRES_URL_NON_POOLING environment variable for Drizzle Kit config.'
  );
}

export default defineConfig({
  dialect: 'postgresql', // 'postgresql' for Supabase
  schema: './lib/db/schema/*',
  out: './drizzle',
  dbCredentials: {
    url,
  },
});
