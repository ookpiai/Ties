-- =============================================
-- FEED AUTO-GENERATION TRIGGERS
-- Automatically creates feed items when platform activity occurs
-- =============================================

-- =============================================
-- 1. TRIGGER: NEW JOB POSTING → FEED ITEM
-- =============================================

CREATE OR REPLACE FUNCTION create_feed_item_for_job()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actor_city TEXT;
  v_actor_lat DECIMAL;
  v_actor_lon DECIMAL;
  v_image_urls TEXT[];
BEGIN
  -- Get actor's location
  SELECT city, latitude, longitude
  INTO v_actor_city, v_actor_lat, v_actor_lon
  FROM profiles
  WHERE id = NEW.organiser_id;

  -- Create feed item
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
    'job_posted',
    NEW.organiser_id,
    NEW.id,
    'job_posting',
    NEW.title,
    LEFT(NEW.description, 200),
    COALESCE(NEW.location, v_actor_city),
    v_actor_lat,
    v_actor_lon,
    jsonb_build_object(
      'budget', NEW.total_budget,
      'event_type', NEW.event_type,
      'start_date', NEW.start_date,
      'end_date', NEW.end_date
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_feed_job_posted ON job_postings;
CREATE TRIGGER trigger_feed_job_posted
  AFTER INSERT ON job_postings
  FOR EACH ROW
  WHEN (NEW.status = 'open')
  EXECUTE FUNCTION create_feed_item_for_job();

-- =============================================
-- 2. TRIGGER: BOOKING COMPLETED → FEED ITEM
-- =============================================

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
      -- Note: amount intentionally excluded for privacy
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_feed_booking_completed ON bookings;
CREATE TRIGGER trigger_feed_booking_completed
  AFTER UPDATE OF status ON bookings
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION create_feed_item_for_completed_booking();

-- =============================================
-- 3. TRIGGER: NEW REVIEW → FEED ITEM
-- =============================================

CREATE OR REPLACE FUNCTION create_feed_item_for_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reviewer_name TEXT;
  v_reviewed_name TEXT;
  v_city TEXT;
  v_lat DECIMAL;
  v_lon DECIMAL;
BEGIN
  -- Only for public reviews
  IF NEW.is_public = false THEN
    RETURN NEW;
  END IF;

  -- Get names
  SELECT display_name INTO v_reviewer_name FROM profiles WHERE id = NEW.by_user_id;
  SELECT display_name, city, latitude, longitude
  INTO v_reviewed_name, v_city, v_lat, v_lon
  FROM profiles WHERE id = NEW.about_user_id;

  -- Create feed item
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
    'review_posted',
    NEW.by_user_id,
    NEW.id,
    'review',
    v_reviewed_name || ' received a ' || NEW.rating || '-star review',
    LEFT(COALESCE(NEW.text, NEW.title), 150),
    v_city,
    v_lat,
    v_lon,
    jsonb_build_object(
      'rating', NEW.rating,
      'about_user_id', NEW.about_user_id,
      'about_user_name', v_reviewed_name,
      'review_type', NEW.review_type
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_feed_review_posted ON reviews;
CREATE TRIGGER trigger_feed_review_posted
  AFTER INSERT ON reviews
  FOR EACH ROW
  WHEN (NEW.is_public = true)
  EXECUTE FUNCTION create_feed_item_for_review();

-- =============================================
-- 4. TRIGGER: NEW PROFILE → FEED ITEM
-- =============================================

CREATE OR REPLACE FUNCTION create_feed_item_for_new_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only create when onboarding is completed
  IF NEW.onboarding_completed = false THEN
    RETURN NEW;
  END IF;

  -- Check if this is a new completion (not already completed before)
  IF OLD IS NOT NULL AND OLD.onboarding_completed = true THEN
    RETURN NEW;
  END IF;

  -- Create feed item
  INSERT INTO feed_items (
    item_type,
    actor_id,
    related_id,
    related_type,
    title,
    description,
    image_urls,
    city,
    latitude,
    longitude,
    metadata
  ) VALUES (
    'profile_joined',
    NEW.id,
    NEW.id,
    'profile',
    NEW.display_name || ' joined TIES Together',
    COALESCE(NEW.specialty, NEW.role),
    CASE WHEN NEW.avatar_url IS NOT NULL THEN ARRAY[NEW.avatar_url] ELSE '{}' END,
    NEW.city,
    NEW.latitude,
    NEW.longitude,
    jsonb_build_object(
      'role', NEW.role,
      'specialty', NEW.specialty
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_feed_profile_joined ON profiles;
CREATE TRIGGER trigger_feed_profile_joined
  AFTER INSERT OR UPDATE OF onboarding_completed ON profiles
  FOR EACH ROW
  WHEN (NEW.onboarding_completed = true)
  EXECUTE FUNCTION create_feed_item_for_new_profile();

-- =============================================
-- 5. TRIGGER: AVAILABILITY OPENED → FEED ITEM
-- =============================================

CREATE OR REPLACE FUNCTION create_feed_item_for_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_name TEXT;
  v_user_role TEXT;
  v_city TEXT;
  v_lat DECIMAL;
  v_lon DECIMAL;
  v_recent_count INTEGER;
BEGIN
  -- Only for availability blocks
  IF NEW.block_type != 'availability' THEN
    RETURN NEW;
  END IF;

  -- Rate limit: don't create feed items if user created one in the last hour
  SELECT COUNT(*) INTO v_recent_count
  FROM feed_items
  WHERE actor_id = NEW.user_id
    AND item_type = 'availability_opened'
    AND created_at > NOW() - INTERVAL '1 hour';

  IF v_recent_count > 0 THEN
    RETURN NEW;
  END IF;

  -- Get user info
  SELECT display_name, role, city, latitude, longitude
  INTO v_user_name, v_user_role, v_city, v_lat, v_lon
  FROM profiles
  WHERE id = NEW.user_id;

  -- Create feed item
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
    expires_at,
    metadata
  ) VALUES (
    'availability_opened',
    NEW.user_id,
    NEW.id,
    'calendar_block',
    v_user_name || ' is available for booking',
    'Available from ' || TO_CHAR(NEW.start_date, 'Mon DD') || ' to ' || TO_CHAR(NEW.end_date, 'Mon DD'),
    v_city,
    v_lat,
    v_lon,
    NEW.end_date, -- Expires when availability ends
    jsonb_build_object(
      'start_date', NEW.start_date,
      'end_date', NEW.end_date,
      'role', v_user_role
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_feed_availability_opened ON calendar_blocks;
CREATE TRIGGER trigger_feed_availability_opened
  AFTER INSERT ON calendar_blocks
  FOR EACH ROW
  WHEN (NEW.block_type = 'availability')
  EXECUTE FUNCTION create_feed_item_for_availability();

-- =============================================
-- 6. CLEANUP FUNCTION: REMOVE EXPIRED FEED ITEMS
-- =============================================

CREATE OR REPLACE FUNCTION cleanup_expired_feed_items()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM feed_items
  WHERE expires_at IS NOT NULL AND expires_at < NOW();

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;

-- =============================================
-- 7. HELPER: CREATE FEED ITEM FOR PORTFOLIO (manual call)
-- =============================================

CREATE OR REPLACE FUNCTION create_portfolio_feed_item(
  p_user_id UUID,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_image_urls TEXT[] DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_name TEXT;
  v_city TEXT;
  v_lat DECIMAL;
  v_lon DECIMAL;
  v_feed_id UUID;
BEGIN
  -- Get user info
  SELECT display_name, city, latitude, longitude
  INTO v_user_name, v_city, v_lat, v_lon
  FROM profiles
  WHERE id = p_user_id;

  -- Create feed item
  INSERT INTO feed_items (
    item_type,
    actor_id,
    title,
    description,
    image_urls,
    city,
    latitude,
    longitude
  ) VALUES (
    'portfolio_update',
    p_user_id,
    v_user_name || ' added new work: ' || p_title,
    p_description,
    p_image_urls,
    v_city,
    v_lat,
    v_lon
  )
  RETURNING id INTO v_feed_id;

  RETURN v_feed_id;
END;
$$;

-- =============================================
-- 8. COMPLETE
-- =============================================

DO $$
BEGIN
  RAISE NOTICE 'Feed Auto-Generation Triggers migration complete';
  RAISE NOTICE 'Triggers created for: job_postings, bookings, reviews, profiles, calendar_blocks';
END $$;
