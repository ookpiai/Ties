-- Migration: Add onboarding_completed column to profiles
-- Date: 2025-11-26
-- Description: Tracks whether user has completed the onboarding flow

-- Add onboarding_completed column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Add index for faster filtering of users who need onboarding
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON profiles(onboarding_completed);

-- Comment for documentation
COMMENT ON COLUMN profiles.onboarding_completed IS 'Whether the user has completed the guided onboarding flow';
