/**
 * PROFILES RLS POLICIES FIX
 * Fixes registration bug: "new row violates row-level security policy"
 *
 * Issue: Users couldn't create their profile during registration
 * Solution: Add proper RLS policies that allow users to create their own profile
 */

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view profiles (needed for discovery, public profiles, etc.)
CREATE POLICY "Anyone can view profiles"
ON profiles
FOR SELECT
USING (true);

-- Policy 2: Users can insert their own profile during registration
-- This allows supabase.auth.signUp() to create the profile
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Users can delete their own profile (optional, for account deletion)
CREATE POLICY "Users can delete own profile"
ON profiles
FOR DELETE
USING (auth.uid() = id);

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';
