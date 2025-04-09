// lib/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Use the application's POOLED connection string
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    '🔴 Missing DATABASE_URL environment variable for the application.'
  );
}

// Configure the client for Supabase Transaction Mode Pooling (port 6543)
const clientOptions = {
  prepare: false, // Required for transaction mode pooling
};

// Instantiate the connection pool
const queryClient = postgres(connectionString, clientOptions);

// Instantiate Drizzle ORM with the schema
export const db = drizzle(
  queryClient,
  {
    schema, // Pass the combined schema object
    logger: process.env.NODE_ENV === 'development', // Log SQL only in development
  }
);

// Optional: Export schema again for convenience if needed elsewhere
export { schema };

// Optional: Log confirmation only once during server startup in dev
if (process.env.NODE_ENV !== 'production') {
  console.log('🔵 Drizzle client initialized using POOLED connection.');
}
