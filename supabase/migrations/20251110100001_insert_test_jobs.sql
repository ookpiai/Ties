-- ============================================
-- TIES Together - Phase 5: Test Data
-- Insert sample job postings for development
-- Date: November 10, 2025
-- ============================================

-- NOTE: Replace 'organiser-user-id' with an actual organiser profile ID from your profiles table
-- You can get this by running: SELECT id FROM profiles WHERE role = 'organiser' LIMIT 1;

-- ============================================
-- TEST JOB 1: Simple Job (1 Role)
-- ============================================

DO $$
DECLARE
  organiser_id UUID;
  job1_id UUID;
  role1_id UUID;
BEGIN
  -- Get an organiser user (or create one if none exists)
  SELECT id INTO organiser_id FROM profiles WHERE role = 'organiser' LIMIT 1;

  IF organiser_id IS NULL THEN
    RAISE NOTICE 'No organiser found. Skipping test data insertion.';
    RAISE NOTICE 'Create an organiser profile first, then run this script.';
  ELSE
    -- Insert simple job posting (DJ only)
    INSERT INTO job_postings (
      organiser_id,
      title,
      description,
      location,
      event_type,
      start_date,
      end_date,
      total_budget
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

    -- Insert single role for this job
    INSERT INTO job_roles (
      job_id,
      role_type,
      role_title,
      role_description,
      budget,
      quantity
    ) VALUES (
      job1_id,
      'freelancer',
      'DJ',
      'Experienced wedding DJ with own equipment',
      600.00,
      1
    ) RETURNING id INTO role1_id;

    RAISE NOTICE 'Created simple job: "Wedding DJ Needed" (ID: %)', job1_id;
  END IF;
END $$;

-- ============================================
-- TEST JOB 2: Multi-Role Job (4 Roles)
-- ============================================

DO $$
DECLARE
  organiser_id UUID;
  job2_id UUID;
BEGIN
  -- Get an organiser user
  SELECT id INTO organiser_id FROM profiles WHERE role = 'organiser' LIMIT 1;

  IF organiser_id IS NOT NULL THEN
    -- Insert multi-role job posting
    INSERT INTO job_postings (
      organiser_id,
      title,
      description,
      location,
      event_type,
      start_date,
      end_date,
      total_budget
    ) VALUES (
      organiser_id,
      'Corporate Event - 150 People',
      'Annual company celebration event requiring multiple services. Professional environment, 150 staff members attending. Looking for top-tier service providers.',
      'Sydney CBD',
      'corporate_event',
      NOW() + INTERVAL '45 days',
      NOW() + INTERVAL '45 days',
      2200.00
    ) RETURNING id INTO job2_id;

    -- Insert 4 roles for this job
    INSERT INTO job_roles (job_id, role_type, role_title, role_description, budget, quantity) VALUES
      (job2_id, 'freelancer', 'DJ', 'Experienced DJ for corporate setting, must have professional sound system', 500.00, 1),
      (job2_id, 'freelancer', 'Bartender', 'Professional bartender with RSA, experience serving 150+ guests', 300.00, 1),
      (job2_id, 'venue', 'Event Space', 'Indoor venue accommodating 150 people, tables and chairs included', 1000.00, 1),
      (job2_id, 'vendor', 'Lighting Equipment', 'Professional event lighting package with technician', 400.00, 1);

    RAISE NOTICE 'Created multi-role job: "Corporate Event - 150 People" (ID: %)', job2_id;
    RAISE NOTICE '  - DJ role ($500)';
    RAISE NOTICE '  - Bartender role ($300)';
    RAISE NOTICE '  - Venue role ($1000)';
    RAISE NOTICE '  - Lighting Vendor role ($400)';
  END IF;
END $$;

-- ============================================
-- TEST JOB 3: Another Simple Job (Photographer)
-- ============================================

DO $$
DECLARE
  organiser_id UUID;
  job3_id UUID;
BEGIN
  SELECT id INTO organiser_id FROM profiles WHERE role = 'organiser' LIMIT 1;

  IF organiser_id IS NOT NULL THEN
    INSERT INTO job_postings (
      organiser_id,
      title,
      description,
      location,
      event_type,
      start_date,
      end_date,
      total_budget
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

    INSERT INTO job_roles (
      job_id,
      role_type,
      role_title,
      role_description,
      budget,
      quantity
    ) VALUES (
      job3_id,
      'freelancer',
      'Photographer',
      'Professional event photographer, must provide edited photos',
      800.00,
      1
    );

    RAISE NOTICE 'Created simple job: "Event Photographer Required" (ID: %)', job3_id;
  END IF;
END $$;

-- ============================================
-- TEST JOB 4: Multi-Role Job (Venue + Services)
-- ============================================

DO $$
DECLARE
  organiser_id UUID;
  job4_id UUID;
BEGIN
  SELECT id INTO organiser_id FROM profiles WHERE role = 'organiser' LIMIT 1;

  IF organiser_id IS NOT NULL THEN
    INSERT INTO job_postings (
      organiser_id,
      title,
      description,
      location,
      event_type,
      start_date,
      end_date,
      total_budget
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
      (job4_id, 'venue', 'Party Venue', 'Outdoor or indoor space for 80 guests with kitchen facilities', 900.00, 1),
      (job4_id, 'freelancer', 'DJ', 'Party DJ with varied music selection suitable for all ages', 400.00, 1),
      (job4_id, 'vendor', 'Catering', 'Catering service for 80 people, buffet style preferred', 400.00, 1);

    RAISE NOTICE 'Created multi-role job: "Birthday Party Package" (ID: %)', job4_id;
  END IF;
END $$;

-- ============================================
-- SUMMARY
-- ============================================

DO $$
DECLARE
  job_count INTEGER;
  role_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO job_count FROM job_postings;
  SELECT COUNT(*) INTO role_count FROM job_roles;

  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Test Data Summary:';
  RAISE NOTICE '  Total Jobs Created: %', job_count;
  RAISE NOTICE '  Total Roles Created: %', role_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Job Types:';
  RAISE NOTICE '  - 2 Simple Jobs (1 role each)';
  RAISE NOTICE '  - 2 Multi-Role Jobs (3-4 roles each)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. View jobs: SELECT * FROM job_postings;';
  RAISE NOTICE '  2. View roles: SELECT * FROM job_roles;';
  RAISE NOTICE '  3. Test in UI once job feed is built';
  RAISE NOTICE '============================================';
END $$;
