-- ============================================
-- REVIEWS & RATINGS SYSTEM
-- Phase 6: Trust & Reputation
-- ============================================

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  about_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  by_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  job_id UUID REFERENCES job_postings(id) ON DELETE SET NULL,

  -- Rating fields
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),

  -- Detailed ratings (optional)
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),

  -- Review content
  title VARCHAR(200),
  text TEXT,

  -- Review type
  review_type VARCHAR(50) DEFAULT 'booking' CHECK (review_type IN ('booking', 'job', 'general')),

  -- Review context
  service_provided VARCHAR(200),

  -- Response from reviewed user
  response_text TEXT,
  response_at TIMESTAMPTZ,

  -- Moderation
  is_public BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  reported_count INTEGER DEFAULT 0,
  moderation_status VARCHAR(50) DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'hidden', 'removed')),

  -- Metadata
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate reviews per booking
  CONSTRAINT unique_review_per_booking UNIQUE (about_user_id, by_user_id, booking_id),
  -- Prevent self-reviews
  CONSTRAINT no_self_review CHECK (about_user_id != by_user_id)
);

-- Review helpful votes
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_vote_per_review UNIQUE (review_id, user_id)
);

-- Profile rating cache (for fast profile display)
CREATE TABLE IF NOT EXISTS profile_ratings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  rating_distribution JSONB DEFAULT '{"1":0,"2":0,"3":0,"4":0,"5":0}',
  avg_communication NUMERIC(3,2),
  avg_professionalism NUMERIC(3,2),
  avg_quality NUMERIC(3,2),
  avg_value NUMERIC(3,2),
  last_review_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reviews_about_user ON reviews(about_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_by_user ON reviews(by_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_public ON reviews(is_public) WHERE is_public = true;

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
DROP POLICY IF EXISTS "Anyone can view public reviews" ON reviews;
CREATE POLICY "Anyone can view public reviews" ON reviews
  FOR SELECT USING (is_public = true AND moderation_status = 'approved');

DROP POLICY IF EXISTS "Users can view reviews about themselves" ON reviews;
CREATE POLICY "Users can view reviews about themselves" ON reviews
  FOR SELECT USING (auth.uid() = about_user_id);

DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = by_user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = by_user_id);

DROP POLICY IF EXISTS "Reviewed users can respond" ON reviews;
CREATE POLICY "Reviewed users can respond" ON reviews
  FOR UPDATE USING (auth.uid() = about_user_id)
  WITH CHECK (auth.uid() = about_user_id);

-- RLS Policies for helpful votes
DROP POLICY IF EXISTS "Anyone can view helpful votes" ON review_helpful_votes;
CREATE POLICY "Anyone can view helpful votes" ON review_helpful_votes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can vote on reviews" ON review_helpful_votes;
CREATE POLICY "Users can vote on reviews" ON review_helpful_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own votes" ON review_helpful_votes;
CREATE POLICY "Users can update own votes" ON review_helpful_votes
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own votes" ON review_helpful_votes;
CREATE POLICY "Users can delete own votes" ON review_helpful_votes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for profile ratings
DROP POLICY IF EXISTS "Anyone can view profile ratings" ON profile_ratings;
CREATE POLICY "Anyone can view profile ratings" ON profile_ratings
  FOR SELECT USING (true);

-- Function to update profile rating cache
CREATE OR REPLACE FUNCTION update_profile_rating_cache()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
  stats RECORD;
BEGIN
  -- Get the user ID we need to update
  IF TG_OP = 'DELETE' THEN
    target_user_id := OLD.about_user_id;
  ELSE
    target_user_id := NEW.about_user_id;
  END IF;

  -- Calculate new stats
  SELECT
    COALESCE(AVG(rating), 0) as avg_rating,
    COUNT(*) as total_count,
    COALESCE(AVG(communication_rating), 0) as avg_comm,
    COALESCE(AVG(professionalism_rating), 0) as avg_prof,
    COALESCE(AVG(quality_rating), 0) as avg_qual,
    COALESCE(AVG(value_rating), 0) as avg_val,
    MAX(created_at) as last_review,
    json_build_object(
      '1', COUNT(*) FILTER (WHERE rating = 1),
      '2', COUNT(*) FILTER (WHERE rating = 2),
      '3', COUNT(*) FILTER (WHERE rating = 3),
      '4', COUNT(*) FILTER (WHERE rating = 4),
      '5', COUNT(*) FILTER (WHERE rating = 5)
    ) as distribution
  INTO stats
  FROM reviews
  WHERE about_user_id = target_user_id
    AND is_public = true
    AND moderation_status = 'approved';

  -- Upsert into profile_ratings
  INSERT INTO profile_ratings (
    user_id,
    average_rating,
    total_reviews,
    rating_distribution,
    avg_communication,
    avg_professionalism,
    avg_quality,
    avg_value,
    last_review_at,
    updated_at
  ) VALUES (
    target_user_id,
    stats.avg_rating,
    stats.total_count,
    stats.distribution,
    NULLIF(stats.avg_comm, 0),
    NULLIF(stats.avg_prof, 0),
    NULLIF(stats.avg_qual, 0),
    NULLIF(stats.avg_val, 0),
    stats.last_review,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    average_rating = EXCLUDED.average_rating,
    total_reviews = EXCLUDED.total_reviews,
    rating_distribution = EXCLUDED.rating_distribution,
    avg_communication = EXCLUDED.avg_communication,
    avg_professionalism = EXCLUDED.avg_professionalism,
    avg_quality = EXCLUDED.avg_quality,
    avg_value = EXCLUDED.avg_value,
    last_review_at = EXCLUDED.last_review_at,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update cache on review changes
DROP TRIGGER IF EXISTS update_rating_cache_trigger ON reviews;
CREATE TRIGGER update_rating_cache_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_profile_rating_cache();

-- Function to update helpful count
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE reviews
    SET helpful_count = (
      SELECT COUNT(*) FROM review_helpful_votes
      WHERE review_id = NEW.review_id AND is_helpful = true
    )
    WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reviews
    SET helpful_count = (
      SELECT COUNT(*) FROM review_helpful_votes
      WHERE review_id = OLD.review_id AND is_helpful = true
    )
    WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for helpful count
DROP TRIGGER IF EXISTS update_helpful_count_trigger ON review_helpful_votes;
CREATE TRIGGER update_helpful_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON review_helpful_votes
FOR EACH ROW
EXECUTE FUNCTION update_review_helpful_count();

-- Function to check if user can leave a review (must have completed booking)
CREATE OR REPLACE FUNCTION can_leave_review(reviewer_id UUID, reviewee_id UUID, p_booking_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  has_completed_booking BOOLEAN;
  already_reviewed BOOLEAN;
BEGIN
  -- Check if there's a completed booking between these users
  SELECT EXISTS (
    SELECT 1 FROM bookings
    WHERE status IN ('completed', 'paid')
    AND (
      (client_id = reviewer_id AND freelancer_id = reviewee_id)
      OR (freelancer_id = reviewer_id AND client_id = reviewee_id)
    )
    AND (p_booking_id IS NULL OR id = p_booking_id)
  ) INTO has_completed_booking;

  -- Check if already reviewed for this specific booking
  IF p_booking_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM reviews
      WHERE by_user_id = reviewer_id
      AND about_user_id = reviewee_id
      AND booking_id = p_booking_id
    ) INTO already_reviewed;
  ELSE
    already_reviewed := false;
  END IF;

  RETURN has_completed_booking AND NOT already_reviewed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add rating column to profiles for quick access
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Function to sync profile rating from cache
CREATE OR REPLACE FUNCTION sync_profile_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET
    rating = NEW.average_rating,
    review_count = NEW.total_reviews
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync profile rating
DROP TRIGGER IF EXISTS sync_profile_rating_trigger ON profile_ratings;
CREATE TRIGGER sync_profile_rating_trigger
AFTER INSERT OR UPDATE ON profile_ratings
FOR EACH ROW
EXECUTE FUNCTION sync_profile_rating();

-- Create notification for new reviews
CREATE OR REPLACE FUNCTION notify_new_review()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for the reviewed user
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    metadata,
    action_url
  ) VALUES (
    NEW.about_user_id,
    'review_received',
    'New Review Received',
    'Someone left you a ' || NEW.rating || '-star review',
    jsonb_build_object(
      'review_id', NEW.id,
      'rating', NEW.rating,
      'reviewer_id', NEW.by_user_id,
      'booking_id', NEW.booking_id
    ),
    '/profile'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for review notification
DROP TRIGGER IF EXISTS notify_new_review_trigger ON reviews;
CREATE TRIGGER notify_new_review_trigger
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION notify_new_review();

-- Grant permissions
GRANT SELECT ON reviews TO authenticated;
GRANT INSERT, UPDATE ON reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON review_helpful_votes TO authenticated;
GRANT SELECT ON profile_ratings TO authenticated;
