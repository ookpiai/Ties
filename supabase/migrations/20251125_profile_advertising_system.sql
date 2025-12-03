-- =============================================================================
-- TIES Together V2 - Profile Advertising & Self-Promotion System
-- Migration: 20251125_profile_advertising_system.sql
--
-- This migration implements a premium profile system inspired by:
-- - Fiverr's tiered gig packages and seller levels
-- - Upwork's specialized profiles and skills system
-- - BookEntertainment's media portfolios
-- - Dribbble's portfolio showcase
-- =============================================================================

-- =============================================================================
-- 1. PROFILE EXTENSIONS
-- Based on Fiverr's enhanced seller profiles and Upwork's profile sections
-- Sources:
--   - https://help.fiverr.com/hc/en-us/articles/360010558598
--   - https://support.upwork.com/hc/en-us/articles/360016144974
-- =============================================================================

-- Add new profile fields for premium self-promotion
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS headline VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tagline VARCHAR(250);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS public_booking_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS booking_page_headline TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS booking_page_description TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS featured_quote TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS response_time_hours INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completion_percent INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Create index for username lookups (for /book/:username routes)
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username) WHERE username IS NOT NULL;

-- =============================================================================
-- 1B. SERVICES TABLE (FIVERR-STYLE GIG LISTINGS)
-- This table must be created before portfolio_items and service_packages
-- which reference it via foreign keys
-- =============================================================================

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Service details
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,

  -- Pricing (base tier - detailed pricing in service_packages)
  starting_price DECIMAL(10,2),

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for service lookups
CREATE INDEX IF NOT EXISTS idx_services_owner_id ON services(owner_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active) WHERE is_active = TRUE;

-- RLS for services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
CREATE POLICY "Services are viewable by everyone"
  ON services FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage their own services" ON services;
CREATE POLICY "Users can manage their own services"
  ON services FOR ALL
  USING (auth.uid() = owner_id);

-- =============================================================================
-- 2. PORTFOLIO ITEMS TABLE
-- Inspired by Fiverr Portfolio and Dribbble shots
-- Sources:
--   - https://help.fiverr.com/hc/en-us/articles/4413134063633-Using-My-Portfolio
--   - https://blog.landr.com/music-portfolio/
-- =============================================================================

CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Media type (inspired by BookEntertainment's video/image/audio support)
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio', 'link', 'before_after')),

  -- Content details
  title VARCHAR(100) NOT NULL,
  description TEXT,

  -- Media URLs (stored in Supabase Storage)
  media_url TEXT,
  thumbnail_url TEXT,

  -- External embeds (YouTube, Vimeo, SoundCloud, Spotify)
  -- Based on industry standard for musician/entertainer portfolios
  external_url TEXT,
  external_platform TEXT CHECK (external_platform IN ('youtube', 'vimeo', 'soundcloud', 'spotify', 'instagram', 'tiktok', 'other')),

  -- Before/After for visual work (photographers, designers)
  before_image_url TEXT,
  after_image_url TEXT,

  -- Tagging system (Fiverr-style skill linking)
  skills_used TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',

  -- Link to related service (Fiverr's "Live Portfolio" concept)
  related_service_id UUID REFERENCES services(id) ON DELETE SET NULL,

  -- Display and engagement
  display_order INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for portfolio queries
CREATE INDEX IF NOT EXISTS idx_portfolio_user_id ON portfolio_items(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_featured ON portfolio_items(user_id, is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_portfolio_type ON portfolio_items(user_id, type);

-- =============================================================================
-- 3. SERVICE PACKAGES TABLE (TIERED PRICING)
-- Based on Fiverr's standardized gig packages (Basic/Standard/Premium)
-- Sources:
--   - https://help.fiverr.com/hc/en-us/articles/4410009235601-Standardized-Gig-packages
--   - https://www.freshbooks.com/blog/value-based-tiered-pricing
-- =============================================================================

CREATE TABLE IF NOT EXISTS service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,

  -- Tier structure (Fiverr's 3-tier model)
  tier TEXT NOT NULL CHECK (tier IN ('basic', 'standard', 'premium')),

  -- Package details
  name VARCHAR(50) NOT NULL, -- e.g., "Starter", "Professional", "Enterprise"
  description TEXT,

  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2), -- For showing discounts

  -- Delivery (Fiverr-style)
  delivery_time_days INTEGER NOT NULL DEFAULT 7,
  delivery_time_unit TEXT DEFAULT 'days' CHECK (delivery_time_unit IN ('hours', 'days', 'weeks')),

  -- Revisions (common in creative services)
  revisions_included INTEGER DEFAULT 1,
  unlimited_revisions BOOLEAN DEFAULT FALSE,

  -- What's included (Fiverr comparison table style)
  features JSONB DEFAULT '[]', -- Array of { feature: string, included: boolean, value?: string }

  -- Extras that can be added
  available_extras JSONB DEFAULT '[]', -- Array of { name, price, description }

  -- UI helpers
  is_popular BOOLEAN DEFAULT FALSE, -- Show "Most Popular" badge
  is_recommended BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure only one package per tier per service
  UNIQUE(service_id, tier)
);

-- Index for service package lookups
CREATE INDEX IF NOT EXISTS idx_service_packages_service_id ON service_packages(service_id);

-- =============================================================================
-- 4. USER BADGES TABLE (VERIFICATION & TRUST SIGNALS)
-- Inspired by Fiverr seller levels and Upwork talent badges
-- Sources:
--   - https://www.freelancer.com/verified
--   - https://help.fiverr.com/hc/en-us/articles/29453184449169-Fiverr-Pro-freelancer-Badge-and-benefits
--   - https://support.upwork.com/hc/en-us/articles/360001176427
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Badge types based on industry standards
  badge_type TEXT NOT NULL CHECK (badge_type IN (
    -- Verification badges
    'identity_verified',    -- ID check completed
    'payment_verified',     -- Stripe Connect active
    'email_verified',       -- Email confirmed
    'phone_verified',       -- Phone number confirmed

    -- Performance badges (Upwork-style)
    'rising_talent',        -- New, promising (3+ completed, 4.5+ rating)
    'top_rated',           -- Established (10+ completed, 4.8+ rating)
    'top_rated_plus',      -- Elite (25+ completed, 4.9+ rating, low cancellation)

    -- Pro badges (Fiverr Pro style)
    'pro_verified',        -- Manually vetted professional

    -- Behavior badges
    'fast_responder',      -- < 2hr average response time
    'on_time_delivery',    -- 95%+ on-time completion rate
    'repeat_clients',      -- 30%+ repeat client rate

    -- Special badges
    'founding_member',     -- Early platform adopter
    'community_champion',  -- Active community contributor
    'featured_talent'      -- Staff pick / featured
  )),

  -- Badge metadata
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Some badges may expire (e.g., monthly top performer)
  awarded_reason TEXT,

  -- Prevent duplicate badges
  UNIQUE(user_id, badge_type)
);

-- Index for badge lookups
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_type ON user_badges(badge_type);

-- =============================================================================
-- 5. SKILLS TABLE (MASTER LIST)
-- Based on Upwork's category/skill system
-- Sources:
--   - https://support.upwork.com/hc/en-us/articles/360024526754-Profile-categories-and-skills
-- =============================================================================

CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Skill details
  name VARCHAR(100) NOT NULL UNIQUE,
  category TEXT NOT NULL, -- e.g., "Music", "Photography", "Design", "Technical"
  subcategory TEXT, -- e.g., "DJ", "Live Sound", "Portrait"

  -- UI helpers
  icon TEXT, -- Lucide icon name
  color TEXT, -- Hex color for skill badge

  -- Popularity tracking
  usage_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 6. USER SKILLS TABLE (JUNCTION)
-- Links users to skills with proficiency levels (Upwork-style)
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,

  -- Proficiency (Fiverr's skill levels)
  proficiency TEXT DEFAULT 'intermediate' CHECK (proficiency IN ('beginner', 'intermediate', 'expert')),

  -- Experience
  years_experience INTEGER DEFAULT 0,

  -- Display priority (Upwork shows top skills prominently)
  is_primary BOOLEAN DEFAULT FALSE, -- Top 3-5 highlighted skills
  display_order INTEGER DEFAULT 0,

  -- Social proof
  endorsement_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate skill assignments
  UNIQUE(user_id, skill_id)
);

-- Index for skill queries
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON user_skills(skill_id);

-- =============================================================================
-- 7. SKILL ENDORSEMENTS TABLE
-- LinkedIn/Upwork-style endorsements from other users
-- =============================================================================

CREATE TABLE IF NOT EXISTS skill_endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_skill_id UUID NOT NULL REFERENCES user_skills(id) ON DELETE CASCADE,
  endorsed_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate endorsements
  UNIQUE(user_skill_id, endorsed_by)
);

-- =============================================================================
-- 8. PROFILE STATS TABLE (MATERIALIZED/COMPUTED)
-- Real stats for social proof (vs hardcoded placeholder values)
-- =============================================================================

CREATE TABLE IF NOT EXISTS profile_stats (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

  -- Booking stats
  total_bookings_completed INTEGER DEFAULT 0,
  total_bookings_cancelled INTEGER DEFAULT 0,

  -- Financial stats (privacy: only user sees exact amounts)
  total_revenue_earned DECIMAL(12,2) DEFAULT 0,
  average_booking_value DECIMAL(10,2) DEFAULT 0,

  -- Rating stats
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  five_star_count INTEGER DEFAULT 0,

  -- Performance metrics
  on_time_delivery_rate DECIMAL(5,2) DEFAULT 100, -- Percentage
  repeat_client_rate DECIMAL(5,2) DEFAULT 0, -- Percentage
  response_rate DECIMAL(5,2) DEFAULT 100, -- Percentage
  average_response_time_hours INTEGER DEFAULT 24,

  -- Engagement stats
  profile_views_total INTEGER DEFAULT 0,
  profile_views_30d INTEGER DEFAULT 0,
  profile_views_7d INTEGER DEFAULT 0,

  -- Timestamps
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  last_booking_at TIMESTAMPTZ,
  member_since TIMESTAMPTZ DEFAULT NOW(),

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 9. PROFILE VIEW TRACKING
-- For accurate view counts
-- =============================================================================

CREATE TABLE IF NOT EXISTS profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL for anonymous views

  -- Context
  source TEXT, -- 'discovery', 'search', 'direct', 'booking'

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for view queries
CREATE INDEX IF NOT EXISTS idx_profile_views_profile_id ON profile_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_created_at ON profile_views(created_at);

-- =============================================================================
-- 10. EDUCATION & CERTIFICATIONS
-- Fiverr/Upwork-style credentials
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Education details
  institution VARCHAR(200) NOT NULL,
  degree VARCHAR(200),
  field_of_study VARCHAR(200),

  -- Dates
  start_year INTEGER,
  end_year INTEGER,
  is_current BOOLEAN DEFAULT FALSE,

  -- Display
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Certification details
  name VARCHAR(200) NOT NULL,
  issuing_organization VARCHAR(200) NOT NULL,

  -- Dates
  issue_date DATE,
  expiry_date DATE,

  -- Verification
  credential_id VARCHAR(100),
  credential_url TEXT,

  -- Display
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_education_user_id ON user_education(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certifications_user_id ON user_certifications(user_id);

-- =============================================================================
-- 11. INSERT DEFAULT SKILLS
-- Pre-populate skills for the entertainment industry
-- =============================================================================

INSERT INTO skills (name, category, subcategory, icon, color) VALUES
  -- Music & Performance
  ('DJ', 'Music & Performance', 'DJ', 'Music', '#8B5CF6'),
  ('Live Vocals', 'Music & Performance', 'Singer', 'Mic', '#EC4899'),
  ('Live Band', 'Music & Performance', 'Band', 'Users', '#F59E0B'),
  ('Solo Musician', 'Music & Performance', 'Musician', 'Guitar', '#10B981'),
  ('MC/Host', 'Music & Performance', 'Host', 'Megaphone', '#3B82F6'),
  ('Acoustic Set', 'Music & Performance', 'Musician', 'Music2', '#6366F1'),

  -- Photography & Video
  ('Event Photography', 'Photography & Video', 'Photography', 'Camera', '#EF4444'),
  ('Portrait Photography', 'Photography & Video', 'Photography', 'User', '#F97316'),
  ('Videography', 'Photography & Video', 'Video', 'Video', '#14B8A6'),
  ('Drone Photography', 'Photography & Video', 'Photography', 'Plane', '#8B5CF6'),
  ('Photo Editing', 'Photography & Video', 'Post-Production', 'ImagePlus', '#EC4899'),
  ('Video Editing', 'Photography & Video', 'Post-Production', 'Film', '#3B82F6'),

  -- Technical & Production
  ('Live Sound', 'Technical & Production', 'Audio', 'Speaker', '#10B981'),
  ('Lighting Design', 'Technical & Production', 'Lighting', 'Lightbulb', '#F59E0B'),
  ('Stage Management', 'Technical & Production', 'Production', 'Layout', '#6366F1'),
  ('AV Tech', 'Technical & Production', 'Technical', 'Monitor', '#14B8A6'),
  ('Backline Tech', 'Technical & Production', 'Technical', 'Guitar', '#EF4444'),

  -- Event Services
  ('Event Planning', 'Event Services', 'Planning', 'Calendar', '#8B5CF6'),
  ('Catering', 'Event Services', 'Food & Beverage', 'Utensils', '#F97316'),
  ('Bar Services', 'Event Services', 'Food & Beverage', 'Wine', '#EC4899'),
  ('Decoration', 'Event Services', 'Decor', 'Sparkles', '#10B981'),
  ('Floristry', 'Event Services', 'Decor', 'Flower', '#F59E0B'),

  -- Entertainment Acts
  ('Magician', 'Entertainment', 'Performance', 'Wand', '#6366F1'),
  ('Comedian', 'Entertainment', 'Performance', 'Laugh', '#3B82F6'),
  ('Dance Performer', 'Entertainment', 'Performance', 'Music', '#EC4899'),
  ('Fire Performer', 'Entertainment', 'Performance', 'Flame', '#EF4444'),
  ('Circus Acts', 'Entertainment', 'Performance', 'Star', '#F59E0B'),

  -- Design & Creative
  ('Graphic Design', 'Design & Creative', 'Design', 'PenTool', '#8B5CF6'),
  ('Brand Design', 'Design & Creative', 'Design', 'Palette', '#14B8A6'),
  ('Signage', 'Design & Creative', 'Print', 'Sign', '#10B981'),
  ('Invitations', 'Design & Creative', 'Print', 'Mail', '#EC4899')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 12. ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Portfolio Items RLS
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Portfolio items are viewable by everyone" ON portfolio_items;
CREATE POLICY "Portfolio items are viewable by everyone"
  ON portfolio_items FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage their own portfolio items" ON portfolio_items;
CREATE POLICY "Users can manage their own portfolio items"
  ON portfolio_items FOR ALL
  USING (auth.uid() = user_id);

-- Service Packages RLS
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service packages are viewable by everyone" ON service_packages;
CREATE POLICY "Service packages are viewable by everyone"
  ON service_packages FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage packages for their own services" ON service_packages;
CREATE POLICY "Users can manage packages for their own services"
  ON service_packages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = service_packages.service_id
      AND services.owner_id = auth.uid()
    )
  );

-- User Badges RLS
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Badges are viewable by everyone" ON user_badges;
CREATE POLICY "Badges are viewable by everyone"
  ON user_badges FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only system can manage badges" ON user_badges;
CREATE POLICY "Only system can manage badges"
  ON user_badges FOR ALL
  USING (false); -- Badges are managed by system/admin only

-- Skills RLS
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Skills are viewable by everyone" ON skills;
CREATE POLICY "Skills are viewable by everyone"
  ON skills FOR SELECT
  USING (true);

-- User Skills RLS
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User skills are viewable by everyone" ON user_skills;
CREATE POLICY "User skills are viewable by everyone"
  ON user_skills FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage their own skills" ON user_skills;
CREATE POLICY "Users can manage their own skills"
  ON user_skills FOR ALL
  USING (auth.uid() = user_id);

-- Skill Endorsements RLS
ALTER TABLE skill_endorsements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Endorsements are viewable by everyone" ON skill_endorsements;
CREATE POLICY "Endorsements are viewable by everyone"
  ON skill_endorsements FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can endorse" ON skill_endorsements;
CREATE POLICY "Authenticated users can endorse"
  ON skill_endorsements FOR INSERT
  WITH CHECK (auth.uid() = endorsed_by);

DROP POLICY IF EXISTS "Users can delete their own endorsements" ON skill_endorsements;
CREATE POLICY "Users can delete their own endorsements"
  ON skill_endorsements FOR DELETE
  USING (auth.uid() = endorsed_by);

-- Profile Stats RLS
ALTER TABLE profile_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profile stats are viewable by everyone" ON profile_stats;
CREATE POLICY "Profile stats are viewable by everyone"
  ON profile_stats FOR SELECT
  USING (true);

-- Profile Views RLS
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profile owners can view their stats" ON profile_views;
CREATE POLICY "Profile owners can view their stats"
  ON profile_views FOR SELECT
  USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Anyone can log a view" ON profile_views;
CREATE POLICY "Anyone can log a view"
  ON profile_views FOR INSERT
  WITH CHECK (true);

-- Education RLS
ALTER TABLE user_education ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Education is viewable by everyone" ON user_education;
CREATE POLICY "Education is viewable by everyone"
  ON user_education FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage their own education" ON user_education;
CREATE POLICY "Users can manage their own education"
  ON user_education FOR ALL
  USING (auth.uid() = user_id);

-- Certifications RLS
ALTER TABLE user_certifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Certifications are viewable by everyone" ON user_certifications;
CREATE POLICY "Certifications are viewable by everyone"
  ON user_certifications FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage their own certifications" ON user_certifications;
CREATE POLICY "Users can manage their own certifications"
  ON user_certifications FOR ALL
  USING (auth.uid() = user_id);

-- =============================================================================
-- 13. FUNCTIONS FOR STATS UPDATES
-- =============================================================================

-- Function to initialize profile stats for new users
CREATE OR REPLACE FUNCTION initialize_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profile_stats (user_id, member_since)
  VALUES (NEW.id, NOW())
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create stats on profile creation
DROP TRIGGER IF EXISTS trigger_initialize_profile_stats ON profiles;
CREATE TRIGGER trigger_initialize_profile_stats
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_profile_stats();

-- Function to update profile view counts
CREATE OR REPLACE FUNCTION update_profile_view_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total and time-based view counts
  UPDATE profile_stats
  SET
    profile_views_total = profile_views_total + 1,
    profile_views_30d = (
      SELECT COUNT(*) FROM profile_views
      WHERE profile_id = NEW.profile_id
      AND created_at > NOW() - INTERVAL '30 days'
    ),
    profile_views_7d = (
      SELECT COUNT(*) FROM profile_views
      WHERE profile_id = NEW.profile_id
      AND created_at > NOW() - INTERVAL '7 days'
    ),
    updated_at = NOW()
  WHERE user_id = NEW.profile_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for view count updates
DROP TRIGGER IF EXISTS trigger_update_profile_view_counts ON profile_views;
CREATE TRIGGER trigger_update_profile_view_counts
  AFTER INSERT ON profile_views
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_view_counts();

-- Function to recalculate profile completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  completion INTEGER := 0;
  total_fields INTEGER := 10;
  profile_record RECORD;
BEGIN
  SELECT * INTO profile_record FROM profiles WHERE id = p_user_id;

  IF profile_record IS NULL THEN
    RETURN 0;
  END IF;

  -- Check each field and add percentage
  IF profile_record.avatar_url IS NOT NULL AND profile_record.avatar_url != '' THEN
    completion := completion + 1;
  END IF;

  IF profile_record.display_name IS NOT NULL AND profile_record.display_name != '' THEN
    completion := completion + 1;
  END IF;

  IF profile_record.headline IS NOT NULL AND profile_record.headline != '' THEN
    completion := completion + 1;
  END IF;

  IF profile_record.bio IS NOT NULL AND LENGTH(profile_record.bio) > 50 THEN
    completion := completion + 1;
  END IF;

  IF profile_record.city IS NOT NULL AND profile_record.city != '' THEN
    completion := completion + 1;
  END IF;

  IF profile_record.hourly_rate IS NOT NULL OR profile_record.daily_rate IS NOT NULL THEN
    completion := completion + 1;
  END IF;

  -- Check for portfolio items
  IF EXISTS (SELECT 1 FROM portfolio_items WHERE user_id = p_user_id LIMIT 1) THEN
    completion := completion + 1;
  END IF;

  -- Check for skills
  IF EXISTS (SELECT 1 FROM user_skills WHERE user_id = p_user_id LIMIT 1) THEN
    completion := completion + 1;
  END IF;

  -- Check for services
  IF EXISTS (SELECT 1 FROM services WHERE owner_id = p_user_id LIMIT 1) THEN
    completion := completion + 1;
  END IF;

  -- Check for languages
  IF profile_record.languages IS NOT NULL AND jsonb_array_length(profile_record.languages) > 0 THEN
    completion := completion + 1;
  END IF;

  RETURN (completion * 100) / total_fields;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 14. UPDATED_AT TRIGGERS
-- =============================================================================

-- Generic updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
DROP TRIGGER IF EXISTS trigger_portfolio_items_updated_at ON portfolio_items;
CREATE TRIGGER trigger_portfolio_items_updated_at
  BEFORE UPDATE ON portfolio_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_service_packages_updated_at ON service_packages;
CREATE TRIGGER trigger_service_packages_updated_at
  BEFORE UPDATE ON service_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
