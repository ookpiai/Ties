-- =============================================
-- SEED FEED DATA FOR TESTING
-- This creates sample feed items from existing profiles
-- =============================================

-- First, fix the trigger to not expose payment amounts
CREATE OR REPLACE FUNCTION create_feed_item_for_completed_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_freelancer_name TEXT;
  v_client_name TEXT;
  v_freelancer_avatar TEXT;
  v_client_avatar TEXT;
  v_city TEXT;
  v_lat DECIMAL;
  v_lon DECIMAL;
BEGIN
  -- Only trigger when status changes to 'completed'
  IF OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- Get participant info
  SELECT display_name, avatar_url, city, latitude, longitude
  INTO v_freelancer_name, v_freelancer_avatar, v_city, v_lat, v_lon
  FROM profiles
  WHERE id = NEW.freelancer_id;

  SELECT display_name, avatar_url
  INTO v_client_name, v_client_avatar
  FROM profiles
  WHERE id = NEW.client_id;

  -- Create feed item for the freelancer (celebrating their completed gig)
  -- NOTE: Payment amount intentionally excluded for privacy
  INSERT INTO feed_items (
    item_type,
    actor_id,
    related_id,
    related_type,
    title,
    description,
    city,
    latitude,
    longitude,
    metadata
  ) VALUES (
    'gig_completed',
    NEW.freelancer_id,
    NEW.id,
    'booking',
    v_freelancer_name || ' completed a gig with ' || v_client_name,
    NEW.service_description,
    v_city,
    v_lat,
    v_lon,
    jsonb_build_object(
      'client_id', NEW.client_id,
      'client_name', v_client_name,
      'client_avatar', v_client_avatar
    )
  );

  RETURN NEW;
END;
$$;

-- =============================================
-- SEED: "New Member Joined" feed items
-- Creates feed items for existing profiles
-- =============================================

INSERT INTO feed_items (item_type, actor_id, related_id, related_type, title, description, image_urls, city, latitude, longitude, metadata, created_at)
SELECT
  'profile_joined',
  p.id,
  p.id,
  'profile',
  p.display_name || ' joined TIES Together',
  COALESCE(p.specialty, p.role),
  CASE WHEN p.avatar_url IS NOT NULL THEN ARRAY[p.avatar_url] ELSE '{}' END,
  p.city,
  p.latitude,
  p.longitude,
  jsonb_build_object('role', p.role, 'specialty', p.specialty),
  p.created_at + interval '1 minute' -- Slightly after profile creation
FROM profiles p
WHERE p.onboarding_completed = true
  AND NOT EXISTS (
    SELECT 1 FROM feed_items fi
    WHERE fi.actor_id = p.id
    AND fi.item_type = 'profile_joined'
  )
LIMIT 10;

-- =============================================
-- SEED: "Job Posted" feed items
-- Creates feed items for existing open jobs
-- =============================================

INSERT INTO feed_items (item_type, actor_id, related_id, related_type, title, description, city, latitude, longitude, metadata, created_at)
SELECT
  'job_posted',
  jp.organiser_id,
  jp.id,
  'job_posting',
  jp.title,
  LEFT(jp.description, 200),
  COALESCE(jp.location, p.city),
  p.latitude,
  p.longitude,
  jsonb_build_object(
    'budget', jp.total_budget,
    'event_type', jp.event_type,
    'start_date', jp.start_date,
    'end_date', jp.end_date
  ),
  jp.created_at + interval '1 minute'
FROM job_postings jp
JOIN profiles p ON p.id = jp.organiser_id
WHERE jp.status = 'open'
  AND NOT EXISTS (
    SELECT 1 FROM feed_items fi
    WHERE fi.related_id = jp.id
    AND fi.item_type = 'job_posted'
  )
LIMIT 10;

-- =============================================
-- SEED: "Gig Completed" feed items
-- Creates feed items for completed bookings (without payment amounts)
-- =============================================

INSERT INTO feed_items (item_type, actor_id, related_id, related_type, title, description, city, latitude, longitude, metadata, created_at)
SELECT
  'gig_completed',
  b.freelancer_id,
  b.id,
  'booking',
  fp.display_name || ' completed a gig with ' || cp.display_name,
  b.service_description,
  fp.city,
  fp.latitude,
  fp.longitude,
  jsonb_build_object(
    'client_id', b.client_id,
    'client_name', cp.display_name,
    'client_avatar', cp.avatar_url
  ),
  COALESCE(b.completed_at, b.updated_at)
FROM bookings b
JOIN profiles fp ON fp.id = b.freelancer_id
JOIN profiles cp ON cp.id = b.client_id
WHERE b.status = 'completed'
  AND NOT EXISTS (
    SELECT 1 FROM feed_items fi
    WHERE fi.related_id = b.id
    AND fi.item_type = 'gig_completed'
  )
LIMIT 5;

-- =============================================
-- SEED: "Review Posted" feed items
-- Creates feed items for public reviews
-- =============================================

INSERT INTO feed_items (item_type, actor_id, related_id, related_type, title, description, city, latitude, longitude, metadata, created_at)
SELECT
  'review_posted',
  r.by_user_id,
  r.id,
  'review',
  ap.display_name || ' received a ' || r.rating || '-star review',
  LEFT(COALESCE(r.text, r.title, 'Great experience!'), 150),
  ap.city,
  ap.latitude,
  ap.longitude,
  jsonb_build_object(
    'rating', r.rating,
    'about_user_id', r.about_user_id,
    'about_user_name', ap.display_name,
    'review_type', r.review_type
  ),
  r.created_at
FROM reviews r
JOIN profiles ap ON ap.id = r.about_user_id
WHERE r.is_public = true
  AND NOT EXISTS (
    SELECT 1 FROM feed_items fi
    WHERE fi.related_id = r.id
    AND fi.item_type = 'review_posted'
  )
LIMIT 5;

-- =============================================
-- SEED: Some sample "portfolio update" items
-- These would normally come from portfolio additions
-- =============================================

INSERT INTO feed_items (item_type, actor_id, title, description, city, latitude, longitude, metadata, created_at)
SELECT
  'portfolio_update',
  p.id,
  p.display_name || ' added new work to their portfolio',
  'Check out their latest ' || LOWER(COALESCE(p.specialty, 'creative')) || ' work',
  p.city,
  p.latitude,
  p.longitude,
  jsonb_build_object('specialty', p.specialty),
  NOW() - (random() * interval '7 days')
FROM profiles p
WHERE p.role IN ('Freelancer', 'Vendor')
  AND p.onboarding_completed = true
  AND NOT EXISTS (
    SELECT 1 FROM feed_items fi
    WHERE fi.actor_id = p.id
    AND fi.item_type = 'portfolio_update'
  )
ORDER BY random()
LIMIT 5;

-- =============================================
-- SEED: "Availability Opened" items
-- =============================================

INSERT INTO feed_items (item_type, actor_id, title, description, city, latitude, longitude, expires_at, metadata, created_at)
SELECT
  'availability_opened',
  p.id,
  p.display_name || ' is available for booking',
  'Available for ' || LOWER(COALESCE(p.specialty, p.role)) || ' work',
  p.city,
  p.latitude,
  p.longitude,
  NOW() + interval '14 days', -- Expires in 2 weeks
  jsonb_build_object('role', p.role, 'specialty', p.specialty),
  NOW() - (random() * interval '3 days')
FROM profiles p
WHERE p.role IN ('Freelancer', 'Vendor', 'Venue')
  AND p.onboarding_completed = true
  AND NOT EXISTS (
    SELECT 1 FROM feed_items fi
    WHERE fi.actor_id = p.id
    AND fi.item_type = 'availability_opened'
  )
ORDER BY random()
LIMIT 5;

-- =============================================
-- Report what was seeded
-- =============================================

DO $$
DECLARE
  v_count INTEGER;
  v_row RECORD;
BEGIN
  SELECT COUNT(*) INTO v_count FROM feed_items;
  RAISE NOTICE 'Feed seeding complete! Total feed items: %', v_count;

  RAISE NOTICE 'Breakdown by type:';
  FOR v_row IN
    SELECT item_type, COUNT(*)::INTEGER as cnt
    FROM feed_items
    GROUP BY item_type
    ORDER BY item_type
  LOOP
    RAISE NOTICE '  %: %', v_row.item_type, v_row.cnt;
  END LOOP;
END $$;
