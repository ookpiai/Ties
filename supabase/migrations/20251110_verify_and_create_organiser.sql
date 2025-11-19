-- ============================================
-- Verify Tables and Create Organiser Profile
-- ============================================

-- Step 1: Verify job tables exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_postings') THEN
    RAISE NOTICE '✅ job_postings table exists';
  ELSE
    RAISE NOTICE '❌ job_postings table NOT found';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_roles') THEN
    RAISE NOTICE '✅ job_roles table exists';
  ELSE
    RAISE NOTICE '❌ job_roles table NOT found';
  END IF;
END $$;

-- Step 2: Check if we have any profiles
DO $$
DECLARE
  profile_count INTEGER;
  organiser_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM profiles;
  SELECT COUNT(*) INTO organiser_count FROM profiles WHERE role = 'organiser';

  RAISE NOTICE '';
  RAISE NOTICE '=== CURRENT PROFILES ===';
  RAISE NOTICE 'Total profiles: %', profile_count;
  RAISE NOTICE 'Organiser profiles: %', organiser_count;
END $$;

-- Step 3: Show existing profiles
SELECT
  id,
  display_name,
  role,
  email
FROM profiles
ORDER BY created_at DESC
LIMIT 5;

-- Step 4: If no organiser, update first profile to be organiser
-- (You can change this to your preferred user)
DO $$
DECLARE
  first_profile_id UUID;
  first_profile_name TEXT;
BEGIN
  -- Check if we have an organiser
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'organiser') THEN
    -- Get first profile
    SELECT id, display_name INTO first_profile_id, first_profile_name
    FROM profiles
    ORDER BY created_at
    LIMIT 1;

    IF first_profile_id IS NOT NULL THEN
      -- Update to organiser
      UPDATE profiles
      SET role = 'organiser'
      WHERE id = first_profile_id;

      RAISE NOTICE '';
      RAISE NOTICE '✅ Updated profile "%" to organiser role', first_profile_name;
      RAISE NOTICE 'Profile ID: %', first_profile_id;
    ELSE
      RAISE NOTICE '';
      RAISE NOTICE '❌ No profiles found in database!';
      RAISE NOTICE 'Please create a user account first (sign up in the app)';
    END IF;
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '✅ Organiser profile already exists';
  END IF;
END $$;

-- Step 5: Show organiser profile
SELECT
  id,
  display_name,
  role,
  email,
  created_at
FROM profiles
WHERE role = 'organiser'
LIMIT 1;
