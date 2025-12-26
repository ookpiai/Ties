-- =============================================
-- SOCIAL FEED SYSTEM
-- Creates the foundation for a social media-style feed
-- showing nearby activity from the creative community
-- =============================================

-- =============================================
-- 1. FEED ITEMS TABLE
-- Stores all feed content (portfolio updates, jobs, events, etc.)
-- =============================================

CREATE TABLE IF NOT EXISTS feed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content type
  item_type TEXT NOT NULL CHECK (item_type IN (
    'portfolio_update',    -- New portfolio item added
    'job_posted',          -- New job posting
    'event_posted',        -- Event/gig announcement
    'gig_completed',       -- Completed booking celebration
    'review_posted',       -- New review received
    'profile_joined',      -- New member joined
    'availability_opened'  -- Freelancer opened availability
  )),

  -- Who created this activity
  actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Related entities (polymorphic reference)
  related_id UUID,
  related_type TEXT CHECK (related_type IN (
    'portfolio_item', 'job_posting', 'booking', 'review', 'profile', 'calendar_block'
  )),

  -- Location for proximity filtering
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  city TEXT,
  country TEXT,

  -- Content preview
  title TEXT NOT NULL,
  description TEXT,
  image_urls TEXT[] DEFAULT '{}',

  -- Engagement metrics (denormalized for performance)
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,

  -- Visibility controls
  is_public BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ, -- For time-limited items like events

  -- Metadata for type-specific data
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient feed queries
CREATE INDEX IF NOT EXISTS idx_feed_items_created ON feed_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_items_actor ON feed_items(actor_id);
CREATE INDEX IF NOT EXISTS idx_feed_items_type ON feed_items(item_type);
CREATE INDEX IF NOT EXISTS idx_feed_items_location ON feed_items(latitude, longitude) WHERE latitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_feed_items_city ON feed_items(city) WHERE city IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_feed_items_public ON feed_items(is_public, created_at DESC) WHERE is_public = true;

-- =============================================
-- 2. FEED INTERACTIONS TABLE
-- Tracks likes, saves, hides, reports
-- =============================================

CREATE TABLE IF NOT EXISTS feed_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feed_item_id UUID NOT NULL REFERENCES feed_items(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'save', 'hide', 'report')),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, feed_item_id, interaction_type)
);

CREATE INDEX IF NOT EXISTS idx_feed_interactions_user ON feed_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_interactions_item ON feed_interactions(feed_item_id);

-- =============================================
-- 3. FEED COMMENTS TABLE
-- Comments on feed items with threading support
-- =============================================

CREATE TABLE IF NOT EXISTS feed_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_item_id UUID NOT NULL REFERENCES feed_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES feed_comments(id) ON DELETE CASCADE, -- For replies
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feed_comments_item ON feed_comments(feed_item_id, created_at);
CREATE INDEX IF NOT EXISTS idx_feed_comments_user ON feed_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_comments_parent ON feed_comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;

-- =============================================
-- 4. USER FOLLOWS TABLE
-- Social graph for personalized feed
-- =============================================

CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

-- =============================================
-- 5. ADD LOCATION FIELDS TO PROFILES (if not exists)
-- =============================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- =============================================
-- 6. ROW LEVEL SECURITY POLICIES
-- =============================================

ALTER TABLE feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Feed items: public items visible to all authenticated users
DROP POLICY IF EXISTS "Public feed items are viewable by all" ON feed_items;
CREATE POLICY "Public feed items are viewable by all"
  ON feed_items FOR SELECT
  TO authenticated
  USING (is_public = true OR actor_id = auth.uid());

-- Feed items: users can create their own
DROP POLICY IF EXISTS "Users can create own feed items" ON feed_items;
CREATE POLICY "Users can create own feed items"
  ON feed_items FOR INSERT
  TO authenticated
  WITH CHECK (actor_id = auth.uid());

-- Feed items: users can update their own
DROP POLICY IF EXISTS "Users can update own feed items" ON feed_items;
CREATE POLICY "Users can update own feed items"
  ON feed_items FOR UPDATE
  TO authenticated
  USING (actor_id = auth.uid());

-- Feed items: users can delete their own
DROP POLICY IF EXISTS "Users can delete own feed items" ON feed_items;
CREATE POLICY "Users can delete own feed items"
  ON feed_items FOR DELETE
  TO authenticated
  USING (actor_id = auth.uid());

-- Feed interactions: users can view all (for like counts)
DROP POLICY IF EXISTS "Users can view all interactions" ON feed_interactions;
CREATE POLICY "Users can view all interactions"
  ON feed_interactions FOR SELECT
  TO authenticated
  USING (true);

-- Feed interactions: users can manage their own
DROP POLICY IF EXISTS "Users can manage own interactions" ON feed_interactions;
CREATE POLICY "Users can manage own interactions"
  ON feed_interactions FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Feed comments: viewable by all authenticated
DROP POLICY IF EXISTS "Comments are viewable by all" ON feed_comments;
CREATE POLICY "Comments are viewable by all"
  ON feed_comments FOR SELECT
  TO authenticated
  USING (true);

-- Feed comments: users can create
DROP POLICY IF EXISTS "Users can create comments" ON feed_comments;
CREATE POLICY "Users can create comments"
  ON feed_comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Feed comments: users can update/delete own
DROP POLICY IF EXISTS "Users can manage own comments" ON feed_comments;
CREATE POLICY "Users can manage own comments"
  ON feed_comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own comments" ON feed_comments;
CREATE POLICY "Users can delete own comments"
  ON feed_comments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- User follows: viewable by all
DROP POLICY IF EXISTS "Follows are viewable by all" ON user_follows;
CREATE POLICY "Follows are viewable by all"
  ON user_follows FOR SELECT
  TO authenticated
  USING (true);

-- User follows: users can manage their own follows
DROP POLICY IF EXISTS "Users can manage own follows" ON user_follows;
CREATE POLICY "Users can manage own follows"
  ON user_follows FOR ALL
  TO authenticated
  USING (follower_id = auth.uid())
  WITH CHECK (follower_id = auth.uid());

-- =============================================
-- 7. HELPER FUNCTIONS
-- =============================================

-- Function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance_km(
  lat1 DECIMAL, lon1 DECIMAL,
  lat2 DECIMAL, lon2 DECIMAL
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  R CONSTANT DECIMAL := 6371; -- Earth's radius in km
  dlat DECIMAL;
  dlon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
    RETURN NULL;
  END IF;

  dlat := RADIANS(lat2 - lat1);
  dlon := RADIANS(lon2 - lon1);

  a := SIN(dlat/2) * SIN(dlat/2) +
       COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
       SIN(dlon/2) * SIN(dlon/2);

  c := 2 * ATAN2(SQRT(a), SQRT(1-a));

  RETURN R * c;
END;
$$;

-- Function to get personalized feed
CREATE OR REPLACE FUNCTION get_feed(
  p_user_id UUID,
  p_latitude DECIMAL DEFAULT NULL,
  p_longitude DECIMAL DEFAULT NULL,
  p_radius_km INTEGER DEFAULT 50,
  p_feed_type TEXT DEFAULT 'for_you', -- 'for_you', 'following', 'nearby'
  p_item_types TEXT[] DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_cursor TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  item_type TEXT,
  actor_id UUID,
  actor_display_name TEXT,
  actor_avatar_url TEXT,
  actor_role TEXT,
  actor_verified BOOLEAN,
  related_id UUID,
  related_type TEXT,
  title TEXT,
  description TEXT,
  image_urls TEXT[],
  city TEXT,
  distance_km DECIMAL,
  view_count INTEGER,
  like_count INTEGER,
  comment_count INTEGER,
  has_liked BOOLEAN,
  has_saved BOOLEAN,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fi.id,
    fi.item_type,
    fi.actor_id,
    p.display_name AS actor_display_name,
    p.avatar_url AS actor_avatar_url,
    p.role AS actor_role,
    COALESCE(p.email_verified, false) AS actor_verified,
    fi.related_id,
    fi.related_type,
    fi.title,
    fi.description,
    fi.image_urls,
    fi.city,
    CASE
      WHEN p_latitude IS NOT NULL AND p_longitude IS NOT NULL AND fi.latitude IS NOT NULL
      THEN calculate_distance_km(p_latitude, p_longitude, fi.latitude, fi.longitude)
      ELSE NULL
    END AS distance_km,
    fi.view_count,
    fi.like_count,
    fi.comment_count,
    EXISTS (
      SELECT 1 FROM feed_interactions
      WHERE feed_item_id = fi.id
      AND user_id = p_user_id
      AND interaction_type = 'like'
    ) AS has_liked,
    EXISTS (
      SELECT 1 FROM feed_interactions
      WHERE feed_item_id = fi.id
      AND user_id = p_user_id
      AND interaction_type = 'save'
    ) AS has_saved,
    fi.metadata,
    fi.created_at,
    fi.expires_at
  FROM feed_items fi
  JOIN profiles p ON p.id = fi.actor_id
  LEFT JOIN user_follows uf ON uf.following_id = fi.actor_id AND uf.follower_id = p_user_id
  LEFT JOIN feed_interactions fi_hide ON fi_hide.feed_item_id = fi.id
    AND fi_hide.user_id = p_user_id
    AND fi_hide.interaction_type = 'hide'
  WHERE
    -- Public items only (or own items)
    (fi.is_public = true OR fi.actor_id = p_user_id)
    -- Not hidden by user
    AND fi_hide.id IS NULL
    -- Not expired
    AND (fi.expires_at IS NULL OR fi.expires_at > NOW())
    -- Cursor pagination
    AND (p_cursor IS NULL OR fi.created_at < p_cursor)
    -- Item type filter
    AND (p_item_types IS NULL OR fi.item_type = ANY(p_item_types))
    -- Feed type filter
    AND (
      CASE p_feed_type
        WHEN 'following' THEN uf.id IS NOT NULL
        WHEN 'nearby' THEN
          p_latitude IS NOT NULL
          AND p_longitude IS NOT NULL
          AND fi.latitude IS NOT NULL
          AND calculate_distance_km(p_latitude, p_longitude, fi.latitude, fi.longitude) <= p_radius_km
        ELSE true -- 'for_you' shows everything
      END
    )
  ORDER BY
    -- Prioritize followed users' content
    CASE WHEN uf.id IS NOT NULL THEN 0 ELSE 1 END,
    -- Then by recency
    fi.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Function to update engagement counts
CREATE OR REPLACE FUNCTION update_feed_item_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.interaction_type = 'like' THEN
      UPDATE feed_items SET like_count = like_count + 1 WHERE id = NEW.feed_item_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.interaction_type = 'like' THEN
      UPDATE feed_items SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.feed_item_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger for interaction counts
DROP TRIGGER IF EXISTS trigger_update_feed_counts ON feed_interactions;
CREATE TRIGGER trigger_update_feed_counts
  AFTER INSERT OR DELETE ON feed_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_feed_item_counts();

-- Function to update comment counts
CREATE OR REPLACE FUNCTION update_feed_comment_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feed_items SET comment_count = comment_count + 1 WHERE id = NEW.feed_item_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feed_items SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.feed_item_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger for comment counts
DROP TRIGGER IF EXISTS trigger_update_comment_counts ON feed_comments;
CREATE TRIGGER trigger_update_comment_counts
  AFTER INSERT OR DELETE ON feed_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_feed_comment_counts();

-- =============================================
-- 8. ENABLE REALTIME
-- =============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'feed_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE feed_items;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'feed_comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE feed_comments;
  END IF;
END $$;

-- =============================================
-- 9. COMPLETE
-- =============================================

DO $$
BEGIN
  RAISE NOTICE 'Social Feed System migration complete';
  RAISE NOTICE 'Tables created: feed_items, feed_interactions, feed_comments, user_follows';
  RAISE NOTICE 'Functions created: get_feed(), calculate_distance_km()';
END $$;
