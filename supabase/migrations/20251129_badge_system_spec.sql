-- =============================================================================
-- TIES Together V2 - Badge System per badge.md Specification
-- Migration: 20251129_badge_system_spec.sql
--
-- Implements the 6+1 badge system:
-- 1. Verified Badge (ID + email + phone + profile complete)
-- 2. Portfolio Badge (5+ portfolio items)
-- 3. Activity Badge (job completed in last 30 days - can expire)
-- 4. Completion Badge (5 jobs completed, no disputes)
-- 5. Quality Badge (4.5+ rating, 5+ reviews)
-- 6. Earnings Badge ($1,000 earned)
-- 7. TIES Pro Badge (subscription-based)
-- =============================================================================

-- =============================================================================
-- 1. UPDATE USER_BADGES TABLE FOR SPEC REQUIREMENTS
-- =============================================================================

-- Add new columns for badge display selection and progress
ALTER TABLE user_badges ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE user_badges ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Create badge progress tracking table
CREATE TABLE IF NOT EXISTS badge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,

  -- Progress tracking
  current_value DECIMAL(12,2) DEFAULT 0,
  target_value DECIMAL(12,2) NOT NULL,
  progress_percent INTEGER DEFAULT 0,

  -- Additional requirements tracking (JSON for flexibility)
  requirements_met JSONB DEFAULT '{}',

  -- Timestamps
  last_updated TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, badge_type)
);

-- Index for progress lookups
CREATE INDEX IF NOT EXISTS idx_badge_progress_user_id ON badge_progress(user_id);

-- =============================================================================
-- 2. BADGE NOTIFICATIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS badge_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Notification details
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'badge_unlocked',
    'badge_progress',
    'reward_activated',
    'badge_expiring',
    'badge_expired'
  )),
  badge_type TEXT NOT NULL,

  -- Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Status
  is_read BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for notification lookups
CREATE INDEX IF NOT EXISTS idx_badge_notifications_user_id ON badge_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_badge_notifications_unread ON badge_notifications(user_id, is_read) WHERE is_read = FALSE;

-- =============================================================================
-- 3. BADGE REWARDS TRACKING
-- =============================================================================

CREATE TABLE IF NOT EXISTS badge_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,

  -- Reward details
  reward_type TEXT NOT NULL CHECK (reward_type IN (
    'search_boost',
    'commission_discount',
    'featured_listing',
    'visibility_boost'
  )),

  -- Reward value/config
  reward_value JSONB DEFAULT '{}',

  -- Status
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMPTZ,

  -- Validity
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for reward lookups
CREATE INDEX IF NOT EXISTS idx_badge_rewards_user_id ON badge_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_badge_rewards_unclaimed ON badge_rewards(user_id, is_claimed) WHERE is_claimed = FALSE;

-- =============================================================================
-- 4. ADD NEW BADGE TYPES TO CONSTRAINT
-- =============================================================================

-- First, drop the existing constraint
ALTER TABLE user_badges DROP CONSTRAINT IF EXISTS user_badges_badge_type_check;

-- Add updated constraint with spec badges
ALTER TABLE user_badges ADD CONSTRAINT user_badges_badge_type_check CHECK (badge_type IN (
  -- Spec badges (badge.md)
  'verified',           -- 1. Verified Badge (ID + email + phone + profile)
  'portfolio',          -- 2. Portfolio Badge (5+ portfolio items)
  'activity',           -- 3. Activity Badge (job in last 30 days)
  'completion',         -- 4. Completion Badge (5 jobs, no disputes)
  'quality',            -- 5. Quality Badge (4.5+ rating, 5+ reviews)
  'earnings',           -- 6. Earnings Badge ($1000 earned)
  'ties_pro',           -- 7. TIES Pro Badge (subscription)

  -- Legacy badges (keep for backwards compatibility)
  'identity_verified',
  'payment_verified',
  'email_verified',
  'phone_verified',
  'rising_talent',
  'top_rated',
  'top_rated_plus',
  'pro_verified',
  'fast_responder',
  'on_time_delivery',
  'repeat_clients',
  'founding_member',
  'community_champion',
  'featured_talent'
));

-- =============================================================================
-- 5. PROFILE FIELDS FOR BADGE REQUIREMENTS
-- =============================================================================

-- Add fields needed for badge tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS identity_verified_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ties_pro_active BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ties_pro_started_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ties_pro_expires_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_job_completed_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_jobs_completed INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_jobs_disputed INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(12,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS selected_badges TEXT[] DEFAULT '{}';

-- =============================================================================
-- 6. BADGE AWARDING FUNCTIONS
-- =============================================================================

-- Function to check and award Verified Badge
CREATE OR REPLACE FUNCTION check_verified_badge(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  profile_rec RECORD;
  is_complete BOOLEAN;
BEGIN
  SELECT * INTO profile_rec FROM profiles WHERE id = p_user_id;

  IF profile_rec IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check all requirements
  -- 1. Identity verified
  -- 2. Email verified
  -- 3. Phone verified
  -- 4. Profile complete (avatar, display_name, bio > 50 chars)
  is_complete := (
    profile_rec.identity_verified = TRUE AND
    profile_rec.email_verified = TRUE AND
    profile_rec.phone_verified = TRUE AND
    profile_rec.avatar_url IS NOT NULL AND
    profile_rec.display_name IS NOT NULL AND
    profile_rec.bio IS NOT NULL AND
    LENGTH(profile_rec.bio) >= 50
  );

  IF is_complete THEN
    -- Award badge if not already awarded
    INSERT INTO user_badges (user_id, badge_type, awarded_reason)
    VALUES (p_user_id, 'verified', 'Completed identity verification and profile')
    ON CONFLICT (user_id, badge_type) DO NOTHING;

    -- Create reward: 30-day search boost
    INSERT INTO badge_rewards (user_id, badge_type, reward_type, reward_value, valid_until)
    VALUES (
      p_user_id,
      'verified',
      'search_boost',
      '{"boost_factor": 1.2, "duration_days": 30}'::jsonb,
      NOW() + INTERVAL '30 days'
    )
    ON CONFLICT DO NOTHING;

    -- Send notification
    INSERT INTO badge_notifications (user_id, notification_type, badge_type, title, message)
    VALUES (
      p_user_id,
      'badge_unlocked',
      'verified',
      'Verified Badge Unlocked!',
      'Congratulations! You''ve earned the Verified Badge. You now have a 30-day search boost and appear in the "Trusted Users" filter.'
    );

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award Portfolio Badge
CREATE OR REPLACE FUNCTION check_portfolio_badge(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  portfolio_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO portfolio_count
  FROM portfolio_items
  WHERE user_id = p_user_id;

  -- Update progress
  INSERT INTO badge_progress (user_id, badge_type, current_value, target_value, progress_percent)
  VALUES (p_user_id, 'portfolio', portfolio_count, 5, LEAST(100, (portfolio_count * 100) / 5))
  ON CONFLICT (user_id, badge_type)
  DO UPDATE SET
    current_value = portfolio_count,
    progress_percent = LEAST(100, (portfolio_count * 100) / 5),
    last_updated = NOW();

  IF portfolio_count >= 5 THEN
    -- Award badge
    INSERT INTO user_badges (user_id, badge_type, awarded_reason)
    VALUES (p_user_id, 'portfolio', 'Uploaded 5+ portfolio items')
    ON CONFLICT (user_id, badge_type) DO NOTHING;

    -- Send notification (only if newly awarded)
    IF NOT EXISTS (
      SELECT 1 FROM badge_notifications
      WHERE user_id = p_user_id
      AND badge_type = 'portfolio'
      AND notification_type = 'badge_unlocked'
    ) THEN
      INSERT INTO badge_notifications (user_id, notification_type, badge_type, title, message)
      VALUES (
        p_user_id,
        'badge_unlocked',
        'portfolio',
        'Portfolio Badge Unlocked!',
        'Your portfolio is looking great! You now have access to premium portfolio layouts and are eligible for Featured User highlights.'
      );
    END IF;

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award/remove Activity Badge (can expire)
CREATE OR REPLACE FUNCTION check_activity_badge(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  last_job TIMESTAMPTZ;
  has_recent_job BOOLEAN;
BEGIN
  SELECT last_job_completed_at INTO last_job
  FROM profiles
  WHERE id = p_user_id;

  -- Check if job completed in last 30 days
  has_recent_job := last_job IS NOT NULL AND last_job > NOW() - INTERVAL '30 days';

  -- Update progress
  INSERT INTO badge_progress (user_id, badge_type, current_value, target_value, progress_percent, requirements_met)
  VALUES (
    p_user_id,
    'activity',
    CASE WHEN has_recent_job THEN 1 ELSE 0 END,
    1,
    CASE WHEN has_recent_job THEN 100 ELSE 0 END,
    jsonb_build_object('last_job_date', last_job, 'days_since_job',
      CASE WHEN last_job IS NOT NULL THEN EXTRACT(DAY FROM NOW() - last_job) ELSE NULL END)
  )
  ON CONFLICT (user_id, badge_type)
  DO UPDATE SET
    current_value = CASE WHEN has_recent_job THEN 1 ELSE 0 END,
    progress_percent = CASE WHEN has_recent_job THEN 100 ELSE 0 END,
    requirements_met = jsonb_build_object('last_job_date', last_job, 'days_since_job',
      CASE WHEN last_job IS NOT NULL THEN EXTRACT(DAY FROM NOW() - last_job) ELSE NULL END),
    last_updated = NOW();

  IF has_recent_job THEN
    -- Award badge
    INSERT INTO user_badges (user_id, badge_type, awarded_reason)
    VALUES (p_user_id, 'activity', 'Completed a job in the last 30 days')
    ON CONFLICT (user_id, badge_type) DO UPDATE SET
      awarded_at = NOW(),
      awarded_reason = 'Completed a job in the last 30 days';

    -- Create reward: 48-hour visibility boost
    INSERT INTO badge_rewards (user_id, badge_type, reward_type, reward_value, valid_until)
    VALUES (
      p_user_id,
      'activity',
      'visibility_boost',
      '{"boost_factor": 1.15, "duration_hours": 48}'::jsonb,
      NOW() + INTERVAL '48 hours'
    )
    ON CONFLICT DO NOTHING;

    RETURN TRUE;
  ELSE
    -- Remove badge if expired
    DELETE FROM user_badges
    WHERE user_id = p_user_id AND badge_type = 'activity';

    -- Notify if badge expired
    IF last_job IS NOT NULL THEN
      INSERT INTO badge_notifications (user_id, notification_type, badge_type, title, message)
      SELECT p_user_id, 'badge_expired', 'activity',
        'Activity Badge Expired',
        'Your Activity Badge has expired due to 30 days of inactivity. Complete a job to re-earn it!'
      WHERE NOT EXISTS (
        SELECT 1 FROM badge_notifications
        WHERE user_id = p_user_id
        AND badge_type = 'activity'
        AND notification_type = 'badge_expired'
        AND created_at > NOW() - INTERVAL '1 day'
      );
    END IF;

    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award Completion Badge
CREATE OR REPLACE FUNCTION check_completion_badge(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  jobs_completed INTEGER;
  jobs_disputed INTEGER;
BEGIN
  SELECT total_jobs_completed, total_jobs_disputed
  INTO jobs_completed, jobs_disputed
  FROM profiles
  WHERE id = p_user_id;

  jobs_completed := COALESCE(jobs_completed, 0);
  jobs_disputed := COALESCE(jobs_disputed, 0);

  -- Update progress
  INSERT INTO badge_progress (user_id, badge_type, current_value, target_value, progress_percent, requirements_met)
  VALUES (
    p_user_id,
    'completion',
    jobs_completed,
    5,
    LEAST(100, (jobs_completed * 100) / 5),
    jsonb_build_object('jobs_completed', jobs_completed, 'jobs_disputed', jobs_disputed)
  )
  ON CONFLICT (user_id, badge_type)
  DO UPDATE SET
    current_value = jobs_completed,
    progress_percent = LEAST(100, (jobs_completed * 100) / 5),
    requirements_met = jsonb_build_object('jobs_completed', jobs_completed, 'jobs_disputed', jobs_disputed),
    last_updated = NOW();

  IF jobs_completed >= 5 AND jobs_disputed = 0 THEN
    -- Award badge
    INSERT INTO user_badges (user_id, badge_type, awarded_reason)
    VALUES (p_user_id, 'completion', 'Completed 5+ jobs with no disputes')
    ON CONFLICT (user_id, badge_type) DO NOTHING;

    -- Create reward: 0% commission on next job
    INSERT INTO badge_rewards (user_id, badge_type, reward_type, reward_value)
    SELECT p_user_id, 'completion', 'commission_discount',
      '{"discount_percent": 100, "max_uses": 1, "description": "0% commission on next job"}'::jsonb
    WHERE NOT EXISTS (
      SELECT 1 FROM badge_rewards
      WHERE user_id = p_user_id
      AND badge_type = 'completion'
      AND reward_type = 'commission_discount'
    );

    -- Send notification
    IF NOT EXISTS (
      SELECT 1 FROM badge_notifications
      WHERE user_id = p_user_id
      AND badge_type = 'completion'
      AND notification_type = 'badge_unlocked'
    ) THEN
      INSERT INTO badge_notifications (user_id, notification_type, badge_type, title, message)
      VALUES (
        p_user_id,
        'badge_unlocked',
        'completion',
        'Completion Badge Unlocked!',
        'You''re a reliable finisher! You''ve unlocked 0% commission on your next job and appear in the "High Reliability" filter.'
      );
    END IF;

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award Quality Badge
CREATE OR REPLACE FUNCTION check_quality_badge(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  review_count INTEGER;
BEGIN
  SELECT ps.average_rating, ps.total_reviews
  INTO avg_rating, review_count
  FROM profile_stats ps
  WHERE ps.user_id = p_user_id;

  avg_rating := COALESCE(avg_rating, 0);
  review_count := COALESCE(review_count, 0);

  -- Update progress (track reviews as primary metric)
  INSERT INTO badge_progress (user_id, badge_type, current_value, target_value, progress_percent, requirements_met)
  VALUES (
    p_user_id,
    'quality',
    review_count,
    5,
    LEAST(100, (review_count * 100) / 5),
    jsonb_build_object('average_rating', avg_rating, 'review_count', review_count, 'rating_requirement', 4.5)
  )
  ON CONFLICT (user_id, badge_type)
  DO UPDATE SET
    current_value = review_count,
    progress_percent = LEAST(100, (review_count * 100) / 5),
    requirements_met = jsonb_build_object('average_rating', avg_rating, 'review_count', review_count, 'rating_requirement', 4.5),
    last_updated = NOW();

  IF review_count >= 5 AND avg_rating >= 4.5 THEN
    -- Award badge
    INSERT INTO user_badges (user_id, badge_type, awarded_reason)
    VALUES (p_user_id, 'quality', 'Maintained 4.5+ rating across 5+ reviews')
    ON CONFLICT (user_id, badge_type) DO NOTHING;

    -- Create reward: 1 free boosted listing per month
    INSERT INTO badge_rewards (user_id, badge_type, reward_type, reward_value, valid_until)
    SELECT p_user_id, 'quality', 'featured_listing',
      '{"free_boosts": 1, "description": "1 free boosted listing this month"}'::jsonb,
      DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
    WHERE NOT EXISTS (
      SELECT 1 FROM badge_rewards
      WHERE user_id = p_user_id
      AND badge_type = 'quality'
      AND reward_type = 'featured_listing'
      AND valid_until > NOW()
    );

    -- Send notification
    IF NOT EXISTS (
      SELECT 1 FROM badge_notifications
      WHERE user_id = p_user_id
      AND badge_type = 'quality'
      AND notification_type = 'badge_unlocked'
    ) THEN
      INSERT INTO badge_notifications (user_id, notification_type, badge_type, title, message)
      VALUES (
        p_user_id,
        'badge_unlocked',
        'quality',
        'Quality Badge Unlocked!',
        'Your excellent reviews have earned you the Quality Badge! You now get 1 free boosted listing per month and are eligible for the Featured User glow.'
      );
    END IF;

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award Earnings Badge
CREATE OR REPLACE FUNCTION check_earnings_badge(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  total_earned DECIMAL(12,2);
BEGIN
  SELECT COALESCE(total_earnings, 0) INTO total_earned
  FROM profiles
  WHERE id = p_user_id;

  -- Update progress
  INSERT INTO badge_progress (user_id, badge_type, current_value, target_value, progress_percent)
  VALUES (
    p_user_id,
    'earnings',
    total_earned,
    1000,
    LEAST(100, (total_earned * 100) / 1000)
  )
  ON CONFLICT (user_id, badge_type)
  DO UPDATE SET
    current_value = total_earned,
    progress_percent = LEAST(100, (total_earned * 100) / 1000),
    last_updated = NOW();

  IF total_earned >= 1000 THEN
    -- Award badge
    INSERT INTO user_badges (user_id, badge_type, awarded_reason)
    VALUES (p_user_id, 'earnings', 'Earned $1,000+ on the platform')
    ON CONFLICT (user_id, badge_type) DO NOTHING;

    -- Create reward: $20 off next transaction (one-time)
    INSERT INTO badge_rewards (user_id, badge_type, reward_type, reward_value)
    SELECT p_user_id, 'earnings', 'commission_discount',
      '{"discount_amount": 20, "max_uses": 1, "description": "$20 off next transaction fee"}'::jsonb
    WHERE NOT EXISTS (
      SELECT 1 FROM badge_rewards
      WHERE user_id = p_user_id
      AND badge_type = 'earnings'
      AND reward_type = 'commission_discount'
    );

    -- Send notification
    IF NOT EXISTS (
      SELECT 1 FROM badge_notifications
      WHERE user_id = p_user_id
      AND badge_type = 'earnings'
      AND notification_type = 'badge_unlocked'
    ) THEN
      INSERT INTO badge_notifications (user_id, notification_type, badge_type, title, message)
      VALUES (
        p_user_id,
        'badge_unlocked',
        'earnings',
        'Earnings Badge Unlocked!',
        'You''ve hit $1,000 in earnings! You''ve earned $20 off your next transaction fee and appear in the "Proven Earners" filter.'
      );
    END IF;

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award/remove TIES Pro Badge
CREATE OR REPLACE FUNCTION check_ties_pro_badge(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_pro BOOLEAN;
BEGIN
  SELECT ties_pro_active INTO is_pro
  FROM profiles
  WHERE id = p_user_id;

  IF COALESCE(is_pro, FALSE) THEN
    -- Award badge
    INSERT INTO user_badges (user_id, badge_type, awarded_reason)
    VALUES (p_user_id, 'ties_pro', 'Active TIES Pro subscription')
    ON CONFLICT (user_id, badge_type) DO UPDATE SET
      awarded_at = NOW(),
      awarded_reason = 'Active TIES Pro subscription';

    -- Send notification if newly subscribed
    IF NOT EXISTS (
      SELECT 1 FROM badge_notifications
      WHERE user_id = p_user_id
      AND badge_type = 'ties_pro'
      AND notification_type = 'badge_unlocked'
      AND created_at > NOW() - INTERVAL '7 days'
    ) THEN
      INSERT INTO badge_notifications (user_id, notification_type, badge_type, title, message)
      VALUES (
        p_user_id,
        'badge_unlocked',
        'ties_pro',
        'Welcome to TIES Pro!',
        'You now have the TIES Pro badge with gold glow, priority search placement, and access to Pro-only features.'
      );
    END IF;

    RETURN TRUE;
  ELSE
    -- Remove badge if subscription ended
    DELETE FROM user_badges
    WHERE user_id = p_user_id AND badge_type = 'ties_pro';

    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 7. MASTER BADGE CHECK FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION check_all_badges(p_user_id UUID)
RETURNS TABLE(badge_type TEXT, is_earned BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT 'verified'::TEXT, check_verified_badge(p_user_id)
  UNION ALL
  SELECT 'portfolio'::TEXT, check_portfolio_badge(p_user_id)
  UNION ALL
  SELECT 'activity'::TEXT, check_activity_badge(p_user_id)
  UNION ALL
  SELECT 'completion'::TEXT, check_completion_badge(p_user_id)
  UNION ALL
  SELECT 'quality'::TEXT, check_quality_badge(p_user_id)
  UNION ALL
  SELECT 'earnings'::TEXT, check_earnings_badge(p_user_id)
  UNION ALL
  SELECT 'ties_pro'::TEXT, check_ties_pro_badge(p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 8. TRIGGERS FOR AUTO-AWARDING
-- =============================================================================

-- Trigger: Check badges when profile is updated
CREATE OR REPLACE FUNCTION trigger_check_badges_on_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Check verified badge if relevant fields changed
  IF (OLD.identity_verified IS DISTINCT FROM NEW.identity_verified) OR
     (OLD.email_verified IS DISTINCT FROM NEW.email_verified) OR
     (OLD.phone_verified IS DISTINCT FROM NEW.phone_verified) OR
     (OLD.avatar_url IS DISTINCT FROM NEW.avatar_url) OR
     (OLD.bio IS DISTINCT FROM NEW.bio) THEN
    PERFORM check_verified_badge(NEW.id);
  END IF;

  -- Check activity badge if last job changed
  IF OLD.last_job_completed_at IS DISTINCT FROM NEW.last_job_completed_at THEN
    PERFORM check_activity_badge(NEW.id);
  END IF;

  -- Check completion badge if jobs completed changed
  IF OLD.total_jobs_completed IS DISTINCT FROM NEW.total_jobs_completed THEN
    PERFORM check_completion_badge(NEW.id);
  END IF;

  -- Check earnings badge if earnings changed
  IF OLD.total_earnings IS DISTINCT FROM NEW.total_earnings THEN
    PERFORM check_earnings_badge(NEW.id);
  END IF;

  -- Check TIES Pro badge if subscription changed
  IF OLD.ties_pro_active IS DISTINCT FROM NEW.ties_pro_active THEN
    PERFORM check_ties_pro_badge(NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_badges_on_profile_update ON profiles;
CREATE TRIGGER trigger_badges_on_profile_update
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_badges_on_profile_update();

-- Trigger: Check portfolio badge when portfolio items change
CREATE OR REPLACE FUNCTION trigger_check_portfolio_badge()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM check_portfolio_badge(NEW.user_id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM check_portfolio_badge(OLD.user_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_portfolio_badge_insert ON portfolio_items;
CREATE TRIGGER trigger_portfolio_badge_insert
  AFTER INSERT ON portfolio_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_portfolio_badge();

DROP TRIGGER IF EXISTS trigger_portfolio_badge_delete ON portfolio_items;
CREATE TRIGGER trigger_portfolio_badge_delete
  AFTER DELETE ON portfolio_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_portfolio_badge();

-- Trigger: Check quality badge when profile stats change
CREATE OR REPLACE FUNCTION trigger_check_quality_badge()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.average_rating IS DISTINCT FROM NEW.average_rating) OR
     (OLD.total_reviews IS DISTINCT FROM NEW.total_reviews) THEN
    PERFORM check_quality_badge(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_quality_badge_on_stats_update ON profile_stats;
CREATE TRIGGER trigger_quality_badge_on_stats_update
  AFTER UPDATE ON profile_stats
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_quality_badge();

-- =============================================================================
-- 9. FUNCTION TO UPDATE BADGE DISPLAY SELECTION
-- =============================================================================

CREATE OR REPLACE FUNCTION update_badge_selection(
  p_user_id UUID,
  p_selected_badges TEXT[]
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Validate: max 5 badges
  IF array_length(p_selected_badges, 1) > 5 THEN
    RAISE EXCEPTION 'Cannot select more than 5 badges to display';
  END IF;

  -- Update profile with selected badges
  UPDATE profiles
  SET selected_badges = p_selected_badges
  WHERE id = p_user_id;

  -- Update is_active and display_order in user_badges
  UPDATE user_badges
  SET
    is_active = (badge_type = ANY(p_selected_badges)),
    display_order = COALESCE(array_position(p_selected_badges, badge_type), 999)
  WHERE user_id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 10. FUNCTION TO GET USER BADGE SUMMARY
-- =============================================================================

CREATE OR REPLACE FUNCTION get_user_badge_summary(p_user_id UUID)
RETURNS TABLE(
  badge_type TEXT,
  is_earned BOOLEAN,
  earned_at TIMESTAMPTZ,
  is_active BOOLEAN,
  display_order INTEGER,
  progress_percent INTEGER,
  current_value DECIMAL,
  target_value DECIMAL,
  requirements_met JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH all_badges AS (
    SELECT unnest(ARRAY['verified', 'portfolio', 'activity', 'completion', 'quality', 'earnings', 'ties_pro']) AS badge_type
  ),
  earned AS (
    SELECT ub.badge_type, ub.awarded_at, ub.is_active, ub.display_order
    FROM user_badges ub
    WHERE ub.user_id = p_user_id
  ),
  progress AS (
    SELECT bp.badge_type, bp.progress_percent, bp.current_value, bp.target_value, bp.requirements_met
    FROM badge_progress bp
    WHERE bp.user_id = p_user_id
  )
  SELECT
    ab.badge_type,
    e.awarded_at IS NOT NULL AS is_earned,
    e.awarded_at,
    COALESCE(e.is_active, FALSE),
    COALESCE(e.display_order, 999),
    COALESCE(p.progress_percent, 0),
    COALESCE(p.current_value, 0),
    COALESCE(p.target_value, 0),
    COALESCE(p.requirements_met, '{}'::jsonb)
  FROM all_badges ab
  LEFT JOIN earned e ON e.badge_type = ab.badge_type
  LEFT JOIN progress p ON p.badge_type = ab.badge_type
  ORDER BY COALESCE(e.display_order, 999), ab.badge_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 11. ROW LEVEL SECURITY
-- =============================================================================

-- Badge Progress RLS
ALTER TABLE badge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badge progress"
  ON badge_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System manages badge progress"
  ON badge_progress FOR ALL
  USING (false);

-- Badge Notifications RLS
ALTER TABLE badge_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON badge_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON badge_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Badge Rewards RLS
ALTER TABLE badge_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rewards"
  ON badge_rewards FOR SELECT
  USING (auth.uid() = user_id);

-- =============================================================================
-- 12. SCHEDULED JOB FOR ACTIVITY BADGE EXPIRY CHECK
-- Note: This should be run as a cron job daily
-- =============================================================================

CREATE OR REPLACE FUNCTION check_activity_badges_expiry()
RETURNS INTEGER AS $$
DECLARE
  users_checked INTEGER := 0;
  user_rec RECORD;
BEGIN
  FOR user_rec IN
    SELECT id FROM profiles
    WHERE last_job_completed_at IS NOT NULL
    AND last_job_completed_at < NOW() - INTERVAL '30 days'
  LOOP
    PERFORM check_activity_badge(user_rec.id);
    users_checked := users_checked + 1;
  END LOOP;

  RETURN users_checked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
