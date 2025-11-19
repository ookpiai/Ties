-- Add rate fields to profiles table
-- Phase 6: Rate Requirement Enforcement

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(10,2);

-- Add comment to explain the fields
COMMENT ON COLUMN profiles.hourly_rate IS 'Hourly rate in local currency (optional)';
COMMENT ON COLUMN profiles.daily_rate IS 'Daily rate in local currency (optional)';

-- Note: At least one rate (hourly OR daily) should be set for Artist/Crew roles
-- This will be enforced in the application layer
