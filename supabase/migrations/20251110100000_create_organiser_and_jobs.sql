-- ============================================
-- Step 1: Update first profile to be an organiser
-- ============================================

-- Update the first "Test User" to be an organiser
UPDATE profiles
SET role = 'organiser'
WHERE id = (
  SELECT id FROM profiles
  WHERE display_name = 'Test User'
  ORDER BY created_at
  LIMIT 1
);

-- Verify organiser was created
DO $$
DECLARE
  organiser_count INTEGER;
  organiser_name TEXT;
BEGIN
  SELECT COUNT(*) INTO organiser_count FROM profiles WHERE role = 'organiser';

  IF organiser_count > 0 THEN
    SELECT display_name INTO organiser_name FROM profiles WHERE role = 'organiser' LIMIT 1;
    RAISE NOTICE '✅ Organiser profile created: %', organiser_name;
  ELSE
    RAISE NOTICE '❌ Failed to create organiser profile';
  END IF;
END $$;

-- ============================================
-- Step 2: Create test jobs
-- ============================================

DO $$
DECLARE
  organiser_id UUID;
  job1_id UUID;
  job2_id UUID;
  job3_id UUID;
  job4_id UUID;
BEGIN
  -- Get organiser ID
  SELECT id INTO organiser_id FROM profiles WHERE role = 'organiser' LIMIT 1;

  IF organiser_id IS NULL THEN
    RAISE NOTICE '❌ No organiser found';
  ELSE
    RAISE NOTICE 'Creating jobs for organiser: %', organiser_id;

    -- Job 1: Simple wedding DJ
    INSERT INTO job_postings (
      organiser_id, title, description, location, event_type,
      start_date, end_date, total_budget
    ) VALUES (
      organiser_id,
      'Wedding DJ Needed',
      'Looking for an experienced wedding DJ for our special day. Must have own equipment and experience with diverse music genres.',
      'Melbourne, VIC',
      'wedding',
      NOW() + INTERVAL '30 days',
      NOW() + INTERVAL '30 days',
      600.00
    ) RETURNING id INTO job1_id;

    INSERT INTO job_roles (job_id, role_type, role_title, role_description, budget, quantity)
    VALUES (job1_id, 'freelancer', 'DJ', 'Experienced wedding DJ with own equipment', 600.00, 1);

    RAISE NOTICE '✅ Created job 1: Wedding DJ Needed';

    -- Job 2: Multi-role corporate event
    INSERT INTO job_postings (
      organiser_id, title, description, location, event_type,
      start_date, end_date, total_budget
    ) VALUES (
      organiser_id,
      'Corporate Event - 150 People',
      'Annual company celebration event requiring multiple services. Professional environment, 150 staff members attending.',
      'Sydney CBD',
      'corporate_event',
      NOW() + INTERVAL '45 days',
      NOW() + INTERVAL '45 days',
      2200.00
    ) RETURNING id INTO job2_id;

    INSERT INTO job_roles (job_id, role_type, role_title, role_description, budget, quantity) VALUES
      (job2_id, 'freelancer', 'DJ', 'Experienced DJ for corporate setting', 500.00, 1),
      (job2_id, 'freelancer', 'Bartender', 'Professional bartender with RSA', 300.00, 1),
      (job2_id, 'venue', 'Event Space', 'Indoor venue for 150 people', 1000.00, 1),
      (job2_id, 'vendor', 'Lighting Equipment', 'Professional event lighting', 400.00, 1);

    RAISE NOTICE '✅ Created job 2: Corporate Event (4 roles)';

    -- Job 3: Event photographer
    INSERT INTO job_postings (
      organiser_id, title, description, location, event_type,
      start_date, end_date, total_budget
    ) VALUES (
      organiser_id,
      'Event Photographer Required',
      'Seeking professional photographer for corporate event. Must provide edited photos within 7 days.',
      'Brisbane, QLD',
      'corporate_event',
      NOW() + INTERVAL '20 days',
      NOW() + INTERVAL '20 days',
      800.00
    ) RETURNING id INTO job3_id;

    INSERT INTO job_roles (job_id, role_type, role_title, role_description, budget, quantity)
    VALUES (job3_id, 'freelancer', 'Photographer', 'Professional event photographer', 800.00, 1);

    RAISE NOTICE '✅ Created job 3: Event Photographer';

    -- Job 4: Birthday party package
    INSERT INTO job_postings (
      organiser_id, title, description, location, event_type,
      start_date, end_date, total_budget
    ) VALUES (
      organiser_id,
      'Birthday Party Package',
      'Planning a 50th birthday party for 80 guests. Need venue and entertainment.',
      'Gold Coast, QLD',
      'private_party',
      NOW() + INTERVAL '60 days',
      NOW() + INTERVAL '60 days',
      1700.00
    ) RETURNING id INTO job4_id;

    INSERT INTO job_roles (job_id, role_type, role_title, role_description, budget, quantity) VALUES
      (job4_id, 'venue', 'Party Venue', 'Space for 80 guests', 900.00, 1),
      (job4_id, 'freelancer', 'DJ', 'Party DJ with varied music', 400.00, 1),
      (job4_id, 'vendor', 'Catering', 'Catering for 80 people', 400.00, 1);

    RAISE NOTICE '✅ Created job 4: Birthday Party (3 roles)';
  END IF;
END $$;

-- ============================================
-- Step 3: Verify everything was created
-- ============================================

DO $$
DECLARE
  job_count INTEGER;
  role_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO job_count FROM job_postings;
  SELECT COUNT(*) INTO role_count FROM job_roles;

  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '✅ SETUP COMPLETE!';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE 'Total Jobs Created: %', job_count;
  RAISE NOTICE 'Total Roles Created: %', role_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Navigate to http://localhost:5173/jobs';
  RAISE NOTICE '════════════════════════════════════════';
END $$;

-- Show the created jobs
SELECT
  jp.title,
  jp.location,
  jp.total_budget,
  COUNT(jr.id) as role_count
FROM job_postings jp
LEFT JOIN job_roles jr ON jr.job_id = jp.id
GROUP BY jp.id, jp.title, jp.location, jp.total_budget
ORDER BY jp.created_at DESC;
