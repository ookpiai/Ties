-- Migration: Add specialty fields to profiles table
-- Date: 2025-11-24
-- Description: Adds specialty and specialty_display_name fields to support two-tier role system
--              Users can now have a primary role (Freelancer/Vendor/Venue) and a specialty (DJ, Photographer, etc.)

-- Add specialty field (stores the value like 'dj', 'photographer', etc.)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS specialty TEXT;

-- Add specialty_display_name field (stores the human-readable label like 'DJ', 'Photographer')
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS specialty_display_name TEXT;

-- Add index on specialty for faster filtering
CREATE INDEX IF NOT EXISTS idx_profiles_specialty ON profiles(specialty);

-- Add index on role and specialty combination for discovery queries
CREATE INDEX IF NOT EXISTS idx_profiles_role_specialty ON profiles(role, specialty);

-- Add comment to document the field
COMMENT ON COLUMN profiles.specialty IS 'Specialty type within the primary role (e.g., dj, photographer, studio). See src/constants/specialties.ts for valid values.';
COMMENT ON COLUMN profiles.specialty_display_name IS 'Human-readable specialty label (e.g., DJ, Photographer, Studio). Auto-populated from specialty value.';
