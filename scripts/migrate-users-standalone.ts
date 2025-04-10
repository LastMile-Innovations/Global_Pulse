// scripts/migrate-users-standalone.ts
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import postgres from "postgres";
import path from "path";

// Load environment variables from .env.local with absolute path
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

  console.log("Environment variables loaded successfully");
  console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL}`);
  console.log(`POSTGRES_URL_NON_POOLING: ${process.env.POSTGRES_URL_NON_POOLING?.substring(0, 20)}...`);
  
  // Create a Supabase client with the service role key for admin access
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Create a direct database connection
  const queryClient = postgres(process.env.POSTGRES_URL_NON_POOLING, { 
    max: 1,
    prepare: false, // Required for Supabase transaction mode pooling
  });

  try {
    // First, check the actual table structure to avoid column mismatch issues
    console.log("🔍 Checking database table structure...");
    
    // Check profiles table structure
    const profilesColumns = await queryClient`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'profiles'
    `;
    const profileColumnNames = profilesColumns.map(col => col.column_name);
    console.log(`✅ Profiles table has columns: ${profileColumnNames.join(', ')}`);
    
    // Check users table structure
    const usersColumns = await queryClient`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `;
    const userColumnNames = usersColumns.map(col => col.column_name);
    console.log(`✅ Users table has columns: ${userColumnNames.join(', ')}`);

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

      // Check if profile exists
      const existingProfile = await queryClient`
        SELECT id FROM profiles WHERE id = ${userId} LIMIT 1
      `;

      // Create profile if it doesn't exist
      if (existingProfile.length === 0) {
        console.log(`📝 Creating profile for user: ${userEmail}`);
        
        // Only include columns we know exist
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

      // Check if user record exists
      const existingUser = await queryClient`
        SELECT id FROM users WHERE id = ${userId} LIMIT 1
      `;

      // Create user record if it doesn't exist
      if (existingUser.length === 0) {
        console.log(`📝 Creating user record for user: ${userEmail}`);
        
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
