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
