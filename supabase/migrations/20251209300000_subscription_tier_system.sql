-- ============================================
-- TIES Together - Subscription Tier System
-- Migration: Add subscription tiers and trial management
-- Date: December 9, 2025
-- ============================================

-- ============================================
-- SECTION 1: Subscription Tier Enum and Profile Fields
-- ============================================

-- Create subscription tier enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
    CREATE TYPE subscription_tier AS ENUM ('free', 'lite', 'pro');
  END IF;
END$$;

-- Add subscription fields to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_tier subscription_tier DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_renews_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_used BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS active_jobs_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS active_studio_projects_count INTEGER DEFAULT 0;

-- ============================================
-- SECTION 2: Subscription Plans Table
-- ============================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tier subscription_tier NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  -- Limits
  active_jobs_limit INTEGER, -- NULL = unlimited
  active_studio_projects_limit INTEGER, -- NULL = unlimited
  milestones_limit INTEGER, -- NULL = unlimited
  payout_days INTEGER NOT NULL DEFAULT 5,
  commission_percent DECIMAL(4,2) NOT NULL DEFAULT 10.00,
  -- Features (booleans)
  invoice_branding BOOLEAN DEFAULT FALSE,
  visibility_boost BOOLEAN DEFAULT FALSE,
  calendar_sync BOOLEAN DEFAULT FALSE,
  large_uploads BOOLEAN DEFAULT FALSE,
  templates BOOLEAN DEFAULT FALSE,
  folders BOOLEAN DEFAULT FALSE,
  pro_badge BOOLEAN DEFAULT FALSE,
  -- Metadata
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plans
INSERT INTO subscription_plans (tier, name, description, price_monthly, price_yearly, active_jobs_limit, active_studio_projects_limit, milestones_limit, payout_days, commission_percent, invoice_branding, visibility_boost, calendar_sync, large_uploads, templates, folders, pro_badge, features)
VALUES
  ('free', 'Free', 'Get started with essential features', 0, 0, 1, 1, 2, 5, 10.00, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE,
   '["Unlimited job applications", "1 active job at a time", "1 Studio project (full power)", "2 milestones per job", "Basic invoicing", "10% platform commission", "5 business day payouts", "Basic profile analytics"]'::jsonb),

  ('lite', 'Lite', 'More flexibility for growing professionals', 19, 190, 3, 3, 3, 3, 10.00, FALSE, TRUE, TRUE, TRUE, FALSE, FALSE, FALSE,
   '["Unlimited job applications", "3 active jobs at a time", "3 Studio projects (full power)", "3 milestones per job", "10% platform commission", "2-3 business day payouts", "Standard analytics", "Calendar sync", "Large file uploads", "Limited visibility boosts"]'::jsonb),

  ('pro', 'Pro', 'Full power for serious professionals', 49, 490, NULL, NULL, NULL, 1, 8.00, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE,
   '["Unlimited job applications", "Unlimited active jobs", "Unlimited Studio projects", "Unlimited milestones + templates", "Branded invoices", "8% platform commission", "Same-day payouts", "Full analytics", "Calendar sync", "Priority visibility", "TIES Pro badge"]'::jsonb)
ON CONFLICT (tier) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  active_jobs_limit = EXCLUDED.active_jobs_limit,
  active_studio_projects_limit = EXCLUDED.active_studio_projects_limit,
  milestones_limit = EXCLUDED.milestones_limit,
  payout_days = EXCLUDED.payout_days,
  commission_percent = EXCLUDED.commission_percent,
  invoice_branding = EXCLUDED.invoice_branding,
  visibility_boost = EXCLUDED.visibility_boost,
  calendar_sync = EXCLUDED.calendar_sync,
  large_uploads = EXCLUDED.large_uploads,
  templates = EXCLUDED.templates,
  folders = EXCLUDED.folders,
  pro_badge = EXCLUDED.pro_badge,
  features = EXCLUDED.features,
  updated_at = NOW();

-- ============================================
-- SECTION 3: Subscription History Table
-- ============================================

CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  previous_tier subscription_tier,
  new_tier subscription_tier NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('upgrade', 'downgrade', 'cancel', 'reactivate', 'trial_start', 'trial_end')),
  stripe_subscription_id TEXT,
  stripe_invoice_id TEXT,
  amount_paid DECIMAL(10,2),
  billing_period TEXT, -- 'monthly' or 'yearly'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user lookup
CREATE INDEX IF NOT EXISTS idx_subscription_history_user ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_created ON subscription_history(created_at DESC);

-- ============================================
-- SECTION 4: Helper Functions
-- ============================================

-- Function to get user's effective tier (accounting for trial)
CREATE OR REPLACE FUNCTION get_effective_tier(p_user_id UUID)
RETURNS subscription_tier AS $$
DECLARE
  v_tier subscription_tier;
  v_trial_ends_at TIMESTAMPTZ;
BEGIN
  SELECT subscription_tier, trial_ends_at
  INTO v_tier, v_trial_ends_at
  FROM profiles
  WHERE id = p_user_id;

  -- If in trial period, return 'pro'
  IF v_trial_ends_at IS NOT NULL AND v_trial_ends_at > NOW() THEN
    RETURN 'pro';
  END IF;

  RETURN COALESCE(v_tier, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can perform action based on tier limits
CREATE OR REPLACE FUNCTION check_tier_limit(
  p_user_id UUID,
  p_limit_type TEXT, -- 'active_jobs' or 'active_studio_projects' or 'milestones'
  p_current_count INTEGER DEFAULT 0
)
RETURNS BOOLEAN AS $$
DECLARE
  v_effective_tier subscription_tier;
  v_limit INTEGER;
BEGIN
  v_effective_tier := get_effective_tier(p_user_id);

  SELECT
    CASE p_limit_type
      WHEN 'active_jobs' THEN active_jobs_limit
      WHEN 'active_studio_projects' THEN active_studio_projects_limit
      WHEN 'milestones' THEN milestones_limit
    END
  INTO v_limit
  FROM subscription_plans
  WHERE tier = v_effective_tier;

  -- NULL means unlimited
  IF v_limit IS NULL THEN
    RETURN TRUE;
  END IF;

  RETURN p_current_count < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get tier limits for a user
CREATE OR REPLACE FUNCTION get_user_tier_limits(p_user_id UUID)
RETURNS TABLE (
  tier subscription_tier,
  active_jobs_limit INTEGER,
  active_studio_projects_limit INTEGER,
  milestones_limit INTEGER,
  payout_days INTEGER,
  commission_percent DECIMAL,
  invoice_branding BOOLEAN,
  visibility_boost BOOLEAN,
  calendar_sync BOOLEAN,
  large_uploads BOOLEAN,
  templates BOOLEAN,
  folders BOOLEAN,
  pro_badge BOOLEAN,
  is_trial BOOLEAN,
  trial_days_remaining INTEGER
) AS $$
DECLARE
  v_effective_tier subscription_tier;
  v_trial_ends_at TIMESTAMPTZ;
  v_is_trial BOOLEAN;
  v_trial_days INTEGER;
BEGIN
  SELECT trial_ends_at INTO v_trial_ends_at FROM profiles WHERE id = p_user_id;

  v_effective_tier := get_effective_tier(p_user_id);
  v_is_trial := (v_trial_ends_at IS NOT NULL AND v_trial_ends_at > NOW());

  IF v_is_trial THEN
    v_trial_days := GREATEST(0, EXTRACT(DAY FROM v_trial_ends_at - NOW())::INTEGER);
  ELSE
    v_trial_days := 0;
  END IF;

  RETURN QUERY
  SELECT
    v_effective_tier,
    sp.active_jobs_limit,
    sp.active_studio_projects_limit,
    sp.milestones_limit,
    sp.payout_days,
    sp.commission_percent,
    sp.invoice_branding,
    sp.visibility_boost,
    sp.calendar_sync,
    sp.large_uploads,
    sp.templates,
    sp.folders,
    sp.pro_badge,
    v_is_trial,
    v_trial_days
  FROM subscription_plans sp
  WHERE sp.tier = v_effective_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to start trial for new user
CREATE OR REPLACE FUNCTION start_user_trial(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_trial_used BOOLEAN;
BEGIN
  SELECT trial_used INTO v_trial_used FROM profiles WHERE id = p_user_id;

  -- Don't allow multiple trials
  IF v_trial_used THEN
    RETURN FALSE;
  END IF;

  UPDATE profiles
  SET
    trial_started_at = NOW(),
    trial_ends_at = NOW() + INTERVAL '30 days',
    trial_used = TRUE,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Log trial start
  INSERT INTO subscription_history (user_id, new_tier, change_type, notes)
  VALUES (p_user_id, 'pro', 'trial_start', '30-day Pro trial started');

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upgrade subscription
CREATE OR REPLACE FUNCTION upgrade_subscription(
  p_user_id UUID,
  p_new_tier subscription_tier,
  p_stripe_subscription_id TEXT DEFAULT NULL,
  p_billing_period TEXT DEFAULT 'monthly'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_tier subscription_tier;
BEGIN
  SELECT subscription_tier INTO v_current_tier FROM profiles WHERE id = p_user_id;

  UPDATE profiles
  SET
    subscription_tier = p_new_tier,
    subscription_started_at = COALESCE(subscription_started_at, NOW()),
    subscription_renews_at = NOW() + CASE WHEN p_billing_period = 'yearly' THEN INTERVAL '1 year' ELSE INTERVAL '1 month' END,
    subscription_cancelled_at = NULL,
    stripe_subscription_id = COALESCE(p_stripe_subscription_id, stripe_subscription_id),
    -- Update TIES Pro badge status
    ties_pro_active = (p_new_tier = 'pro'),
    ties_pro_started_at = CASE WHEN p_new_tier = 'pro' THEN NOW() ELSE ties_pro_started_at END,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Log upgrade
  INSERT INTO subscription_history (user_id, previous_tier, new_tier, change_type, stripe_subscription_id, billing_period)
  VALUES (p_user_id, v_current_tier, p_new_tier, 'upgrade', p_stripe_subscription_id, p_billing_period);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to downgrade subscription
CREATE OR REPLACE FUNCTION downgrade_subscription(
  p_user_id UUID,
  p_new_tier subscription_tier,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_tier subscription_tier;
BEGIN
  SELECT subscription_tier INTO v_current_tier FROM profiles WHERE id = p_user_id;

  UPDATE profiles
  SET
    subscription_tier = p_new_tier,
    subscription_renews_at = NULL,
    ties_pro_active = (p_new_tier = 'pro'),
    ties_pro_expires_at = CASE WHEN p_new_tier != 'pro' THEN NOW() ELSE ties_pro_expires_at END,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Log downgrade
  INSERT INTO subscription_history (user_id, previous_tier, new_tier, change_type, notes)
  VALUES (p_user_id, v_current_tier, p_new_tier, 'downgrade', p_reason);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SECTION 5: Active Jobs/Projects Counter Triggers
-- ============================================

-- Function to update active jobs count
CREATE OR REPLACE FUNCTION update_active_jobs_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update organiser's active jobs count
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE profiles
    SET active_jobs_count = (
      SELECT COUNT(*)
      FROM job_postings
      WHERE organiser_id = NEW.organiser_id
      AND status IN ('open', 'in_progress')
    )
    WHERE id = NEW.organiser_id;
  END IF;

  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    UPDATE profiles
    SET active_jobs_count = (
      SELECT COUNT(*)
      FROM job_postings
      WHERE organiser_id = COALESCE(OLD.organiser_id, NEW.organiser_id)
      AND status IN ('open', 'in_progress')
    )
    WHERE id = COALESCE(OLD.organiser_id, NEW.organiser_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_update_active_jobs_count ON job_postings;

-- Create trigger for job postings
CREATE TRIGGER trigger_update_active_jobs_count
AFTER INSERT OR UPDATE OF status OR DELETE ON job_postings
FOR EACH ROW
EXECUTE FUNCTION update_active_jobs_count();

-- ============================================
-- SECTION 6: RLS Policies
-- ============================================

-- Subscription plans are readable by all authenticated users
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view subscription plans" ON subscription_plans;
CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- Subscription history is only viewable by the user
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscription history" ON subscription_history;
CREATE POLICY "Users can view own subscription history"
  ON subscription_history FOR SELECT
  USING (user_id = auth.uid());

-- ============================================
-- SECTION 7: Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_trial_ends_at ON profiles(trial_ends_at) WHERE trial_ends_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription ON profiles(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

-- ============================================
-- Complete
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Migration complete: Subscription tier system installed';
  RAISE NOTICE 'Tiers: free (1 job, 1 project), lite (3 jobs, 3 projects), pro (unlimited)';
  RAISE NOTICE 'Trial: 30 days Pro access for new users';
END $$;
