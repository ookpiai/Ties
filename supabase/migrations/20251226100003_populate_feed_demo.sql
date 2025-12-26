-- =============================================
-- POPULATE FEED WITH DEMO CONTENT
-- This ensures the feed has visible content for testing
-- =============================================

-- First, let's make sure the feed has content from all profiles
-- regardless of their onboarding status

-- Clear any existing feed items to start fresh
DELETE FROM feed_items;

-- Create "profile joined" items for ALL profiles with display names
INSERT INTO feed_items (item_type, actor_id, related_id, related_type, title, description, image_urls, city, latitude, longitude, metadata, created_at, is_public)
SELECT
  'profile_joined',
  p.id,
  p.id,
  'profile',
  COALESCE(p.display_name, 'A new creative') || ' joined TIES Together',
  COALESCE(p.specialty, p.role, 'Creative Professional'),
  CASE WHEN p.avatar_url IS NOT NULL AND p.avatar_url != '' THEN ARRAY[p.avatar_url] ELSE '{}' END,
  p.city,
  p.latitude,
  p.longitude,
  jsonb_build_object('role', p.role, 'specialty', p.specialty),
  NOW() - (random() * interval '7 days'),
  true
FROM profiles p
WHERE p.display_name IS NOT NULL AND p.display_name != '';

-- Create "job posted" items for all job postings
INSERT INTO feed_items (item_type, actor_id, related_id, related_type, title, description, city, latitude, longitude, metadata, created_at, is_public)
SELECT
  'job_posted',
  jp.organiser_id,
  jp.id,
  'job_posting',
  jp.title,
  LEFT(COALESCE(jp.description, 'Looking for talented creatives for this opportunity'), 200),
  COALESCE(jp.location, p.city, 'Remote'),
  p.latitude,
  p.longitude,
  jsonb_build_object(
    'budget', jp.total_budget,
    'event_type', jp.event_type,
    'start_date', jp.start_date,
    'end_date', jp.end_date,
    'status', jp.status
  ),
  COALESCE(jp.created_at, NOW()) - (random() * interval '3 days'),
  true
FROM job_postings jp
JOIN profiles p ON p.id = jp.organiser_id
WHERE jp.title IS NOT NULL;

-- Create "availability opened" items for freelancers
INSERT INTO feed_items (item_type, actor_id, title, description, city, latitude, longitude, expires_at, metadata, created_at, is_public)
SELECT
  'availability_opened',
  p.id,
  COALESCE(p.display_name, 'A creative') || ' is available for booking',
  'Available for ' || LOWER(COALESCE(p.specialty, p.role, 'creative')) || ' work in ' || COALESCE(p.city, 'your area'),
  p.city,
  p.latitude,
  p.longitude,
  NOW() + interval '30 days',
  jsonb_build_object('role', p.role, 'specialty', p.specialty, 'hourly_rate', p.hourly_rate),
  NOW() - (random() * interval '2 days'),
  true
FROM profiles p
WHERE p.role IN ('Freelancer', 'Vendor', 'Venue')
  AND p.display_name IS NOT NULL;

-- Create "portfolio update" items for some profiles
INSERT INTO feed_items (item_type, actor_id, title, description, city, latitude, longitude, metadata, created_at, is_public)
SELECT
  'portfolio_update',
  p.id,
  COALESCE(p.display_name, 'A creative') || ' added new work to their portfolio',
  'Check out their latest ' || LOWER(COALESCE(p.specialty, 'creative')) || ' work',
  p.city,
  p.latitude,
  p.longitude,
  jsonb_build_object('specialty', p.specialty),
  NOW() - (random() * interval '5 days'),
  true
FROM profiles p
WHERE p.role = 'Freelancer'
  AND p.display_name IS NOT NULL
LIMIT 10;

-- Create "gig completed" items from completed bookings
INSERT INTO feed_items (item_type, actor_id, related_id, related_type, title, description, city, latitude, longitude, metadata, created_at, is_public)
SELECT
  'gig_completed',
  b.freelancer_id,
  b.id,
  'booking',
  fp.display_name || ' completed a gig' || CASE WHEN cp.display_name IS NOT NULL THEN ' with ' || cp.display_name ELSE '' END,
  COALESCE(b.service_description, 'Professional creative services'),
  fp.city,
  fp.latitude,
  fp.longitude,
  jsonb_build_object(
    'client_id', b.client_id,
    'client_name', cp.display_name,
    'client_avatar', cp.avatar_url
  ),
  COALESCE(b.completed_at, b.updated_at, NOW()) - interval '1 day',
  true
FROM bookings b
JOIN profiles fp ON fp.id = b.freelancer_id
JOIN profiles cp ON cp.id = b.client_id
WHERE b.status = 'completed'
  AND fp.display_name IS NOT NULL;

-- Create some demo feed items if we still don't have many
-- This uses a hardcoded approach as a fallback

DO $$
DECLARE
  v_count INTEGER;
  v_profile_id UUID;
  v_profile_name TEXT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM feed_items;

  IF v_count < 5 THEN
    -- Get any profile to use as demo
    SELECT id, COALESCE(display_name, 'Demo User')
    INTO v_profile_id, v_profile_name
    FROM profiles
    LIMIT 1;

    IF v_profile_id IS NOT NULL THEN
      -- Create some demo items
      INSERT INTO feed_items (item_type, actor_id, title, description, city, metadata, created_at, is_public)
      VALUES
        ('profile_joined', v_profile_id, v_profile_name || ' joined TIES Together', 'Welcome to the creative community!', 'Melbourne', '{"role": "Freelancer"}', NOW() - interval '6 hours', true),
        ('availability_opened', v_profile_id, v_profile_name || ' is available for booking', 'Available for creative work this month', 'Melbourne', '{"role": "Freelancer"}', NOW() - interval '12 hours', true),
        ('portfolio_update', v_profile_id, v_profile_name || ' added new work to their portfolio', 'Check out their latest creative projects', 'Melbourne', '{"specialty": "Photography"}', NOW() - interval '1 day', true);
    END IF;
  END IF;

  SELECT COUNT(*) INTO v_count FROM feed_items;
  RAISE NOTICE 'Feed now has % items', v_count;
END $$;

-- Verify we have content
SELECT
  item_type,
  COUNT(*) as count
FROM feed_items
GROUP BY item_type
ORDER BY count DESC;
