// scripts/migrate-existing-users.ts
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import path from "path";
import fs from "fs";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrateExistingUsers() {
  // Check for required environment variables
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  
  if (!process.env.POSTGRES_URL_NON_POOLING) {
    console.error("Missing required environment variable: POSTGRES_URL_NON_POOLING");
    process.exit(1);
  }
  
  console.log("🔄 Loading schema definition...");
  // Dynamically import the schema to avoid the dependency on lib/db
  const schemaModule = await import("../lib/db/schema");
  const schema = schemaModule.schema || schemaModule;
  
  // Create a direct database connection
  const queryClient = postgres(process.env.POSTGRES_URL_NON_POOLING, { max: 1 });
  const db = drizzle(queryClient);

  // Create a Supabase client with the service role key for admin access
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    console.log("Environment variables loaded successfully");
    console.log("🔍 Fetching all auth users...");

    // Get all users from auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      throw authError;
    }

    console.log(`✅ Found ${authUsers.users.length} auth users`);

    // Process each user
    for (const user of authUsers.users) {
      const userId = user.id;
      const userEmail = user.email;
      const userMetadata = user.user_metadata || {};
      const firstName = userMetadata.first_name || userMetadata.firstName || "";
      const lastName = userMetadata.last_name || userMetadata.lastName || "";

      console.log(`👤 Processing user: ${userEmail} (${userId})`);

      // Check if profile exists using Drizzle
      const existingProfile = await db.select()
        .from(schema.profiles)
        .where(eq(schema.profiles.id, userId))
        .limit(1);

      // Create profile if it doesn't exist
      if (existingProfile.length === 0) {
        console.log(`📝 Creating profile for user: ${userEmail}`);
        
        // Execute a simpler SQL query to avoid schema mismatches
        await queryClient`
          INSERT INTO profiles (id, first_name, last_name, created_at, updated_at)
          VALUES (
            ${userId},
            ${firstName},
            ${lastName},
            ${new Date()},
            ${new Date()}
          )
          ON CONFLICT (id) DO NOTHING
        `;
        
        console.log(`✅ Profile created for user: ${userEmail}`);
      } else {
        console.log(`ℹ️ Profile already exists for user: ${userEmail}`);
      }

      // Check if user record exists using Drizzle
      const existingUser = await db.select()
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1);

      // Create user record if it doesn't exist
      if (existingUser.length === 0) {
        console.log(`📝 Creating user record for user: ${userEmail}`);
        
        // Execute a simpler SQL query to avoid schema mismatches
        await queryClient`
          INSERT INTO users (id, email, role, created_at, updated_at)
          VALUES (
            ${userId},
            ${userEmail || ""},
            ${'user'},
            ${new Date()},
            ${new Date()}
          )
          ON CONFLICT (id) DO NOTHING
        `;
        
        console.log(`✅ User record created for user: ${userEmail}`);
      } else {
        console.log(`ℹ️ User record already exists for user: ${userEmail}`);
      }
    }

    console.log("🎉 Migration completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    // Close the database connection
    await queryClient.end();
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  migrateExistingUsers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Unhandled error during migration:", error);
      process.exit(1);
    });
}

export { migrateExistingUsers };
