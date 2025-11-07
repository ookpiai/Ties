/**
 * AUTO-CREATE PROFILE ON USER SIGNUP
 * Fixes: "new row violates row-level security policy" during registration
 *
 * Problem: Manual profile creation fails because user isn't authenticated
 *          until email is confirmed (if email confirmation enabled)
 *
 * Solution: Use database trigger to automatically create profile when
 *           a new user is added to auth.users table
 */

-- Function to create profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_display_name TEXT;
  user_role TEXT;
  user_bio TEXT;
  user_city TEXT;
  user_avatar TEXT;
BEGIN
  -- Extract metadata with better handling
  user_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'Artist');
  user_bio := NEW.raw_user_meta_data->>'bio';
  user_city := NEW.raw_user_meta_data->>'city';
  user_avatar := NEW.raw_user_meta_data->>'avatar_url';

  -- Insert profile with extracted data
  INSERT INTO public.profiles (id, display_name, role, avatar_url, bio, city)
  VALUES (
    NEW.id,
    user_display_name,
    user_role,
    user_avatar,
    user_bio,
    user_city
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function when new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Now we need to update the RLS policy to allow the trigger to insert
-- The trigger runs with SECURITY DEFINER, so it bypasses RLS
-- But we still need a policy for manual profile updates

-- Keep existing policies as-is, they're correct
