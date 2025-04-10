# Applying the User Record Trigger Function

To ensure that new Supabase Auth users automatically get records created in the `profiles` and `users` tables, follow these steps to apply the trigger function migration:

## Option 1: Apply via Supabase SQL Editor (Recommended)

1. Go to the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql/new) for your project
2. Copy the contents of the SQL file below
3. Paste into the SQL editor and run the query

```sql
-- Migration to create a trigger function that ensures user records exist
-- This will automatically create entries in profiles and users tables when a new auth user is created

-- Create the function that ensures user records exist
CREATE OR REPLACE FUNCTION public.ensure_user_records()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles if not exists
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'first_name')::text, (NEW.raw_user_meta_data->>'firstName')::text, ''),
    COALESCE((NEW.raw_user_meta_data->>'last_name')::text, (NEW.raw_user_meta_data->>'lastName')::text, ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert into users if not exists
  INSERT INTO public.users (
    id, 
    email, 
    role, 
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    'user',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists to avoid errors on re-runs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger to run the function after a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_user_records();
```

## Option 2: Migrate Existing Users

We've already successfully run the script to migrate existing users. If you need to run it again in the future, use:

```bash
npx tsx scripts/migrate-users-standalone.ts
```

## What This Does

1. **Automatic User Record Creation**: Any new users who sign up through Supabase Auth will automatically have corresponding records created in your `profiles` and `users` tables.

2. **Data Consistency**: All existing users now have the necessary records in both tables, ensuring data consistency across your application.

## Troubleshooting

If you encounter any issues with the trigger function, you can check:

1. In the Supabase dashboard, go to Database → Functions to verify the function was created
2. In the Supabase dashboard, go to Database → Triggers to verify the trigger was created
3. Test by creating a new user and checking if records are automatically created
