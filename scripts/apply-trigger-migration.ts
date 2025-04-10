// scripts/apply-trigger-migration.ts
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function applyTriggerMigration() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  // Create a Supabase client with the service role key for admin access
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    console.log("📝 Applying trigger function migration...");

    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), "db", "migrations", "0003_ensure_user_records.sql");
    const sqlContent = fs.readFileSync(sqlFilePath, "utf8");

    // Execute the SQL directly using pg_execute
    // This is a custom RPC function that needs to be enabled in your Supabase project
    const { error } = await supabase.rpc("pg_execute", { query: sqlContent });

    if (error) {
      // If pg_execute is not available, try another approach
      console.log("⚠️ pg_execute RPC failed, trying alternative approach...");
      
      // Split the SQL into separate statements
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      // Execute each statement separately
      for (const stmt of statements) {
        const { error } = await supabase.rpc("pg_execute", { query: stmt });
        if (error) {
          console.error(`Error executing statement: ${stmt}`);
          console.error(error);
          throw error;
        }
      }
    }

    console.log("✅ Trigger function migration applied successfully");
  } catch (error) {
    console.error("❌ Failed to apply trigger function migration:", error);
    
    console.log("\n🔄 Alternative: You may need to apply this migration manually in the Supabase SQL Editor.");
    console.log("1. Go to https://supabase.com/dashboard/project/_/sql/new");
    console.log("2. Copy the contents of db/migrations/0003_ensure_user_records.sql");
    console.log("3. Paste into the SQL editor and run the query");
    
    process.exit(1);
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  applyTriggerMigration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Unhandled error:", error);
      process.exit(1);
    });
}

export { applyTriggerMigration };
