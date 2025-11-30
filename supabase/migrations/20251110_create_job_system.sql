-- ============================================
-- TIES Together - Phase 5: Multi-Role Job System
-- Migration: Create job posting tables
-- Date: November 10, 2025
-- ============================================

-- ============================================
-- 1. JOB POSTINGS TABLE
-- Main container for job posts (1 or many roles)
-- ============================================
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organiser_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  event_type TEXT, -- 'wedding', 'corporate_event', 'concert', 'private_party', etc.
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  total_budget DECIMAL(10,2), -- Optional: Overall budget (sum of role budgets)
  status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'filled', 'cancelled'
  application_deadline TIMESTAMPTZ, -- Optional: Deadline for applications
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_job_status CHECK (status IN ('open', 'in_progress', 'filled', 'cancelled')),
  CONSTRAINT valid_job_dates CHECK (end_date >= start_date),
  CONSTRAINT valid_job_deadline CHECK (application_deadline IS NULL OR application_deadline <= start_date)
);

-- Indexes for job_postings
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_organiser ON job_postings(organiser_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_dates ON job_postings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_job_postings_location ON job_postings(location);

-- ============================================
-- 2. JOB ROLES TABLE
-- Roles within a job (1 to many!)
-- ============================================
CREATE TABLE IF NOT EXISTS job_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL, -- 'freelancer', 'venue', 'vendor'
  role_title TEXT NOT NULL, -- 'DJ', 'Photographer', 'Bartender', 'Lighting Technician', etc.
  role_description TEXT, -- Specific requirements for this role
  budget DECIMAL(10,2), -- Budget allocated for THIS role
  quantity INTEGER DEFAULT 1, -- How many needed (usually 1, but could be "2 bartenders")
  filled_count INTEGER DEFAULT 0, -- How many selected so far
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_role_type CHECK (role_type IN ('freelancer', 'venue', 'vendor')),
  CONSTRAINT valid_quantity CHECK (quantity > 0),
  CONSTRAINT valid_filled CHECK (filled_count >= 0 AND filled_count <= quantity)
);

-- Indexes for job_roles
CREATE INDEX IF NOT EXISTS idx_job_roles_job ON job_roles(job_id);
CREATE INDEX IF NOT EXISTS idx_job_roles_type ON job_roles(role_type);

-- ============================================
-- 3. JOB APPLICATIONS TABLE
-- Applications to specific roles
-- ============================================
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  job_role_id UUID NOT NULL REFERENCES job_roles(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cover_letter TEXT,
  proposed_rate DECIMAL(10,2), -- Applicant's proposed rate (can differ from budget)
  portfolio_links TEXT[], -- Array of URLs
  status TEXT DEFAULT 'pending', -- 'pending', 'selected', 'rejected', 'withdrawn'
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_role_application UNIQUE(job_role_id, applicant_id), -- Can't apply twice to same role
  CONSTRAINT valid_application_status CHECK (status IN ('pending', 'selected', 'rejected', 'withdrawn'))
);

-- Indexes for job_applications
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_role ON job_applications(job_role_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applicant ON job_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);

-- ============================================
-- 4. JOB SELECTIONS TABLE
-- Tracking who was selected
-- ============================================
CREATE TABLE IF NOT EXISTS job_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  job_role_id UUID NOT NULL REFERENCES job_roles(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL, -- Created booking (nullable initially)
  selected_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_role_selection UNIQUE(job_role_id, applicant_id) -- One selection per role
);

-- Indexes for job_selections
CREATE INDEX IF NOT EXISTS idx_job_selections_job ON job_selections(job_id);
CREATE INDEX IF NOT EXISTS idx_job_selections_booking ON job_selections(booking_id);

-- ============================================
-- 5. ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_selections ENABLE ROW LEVEL SECURITY;

-- ===== JOB POSTINGS POLICIES =====

-- Anyone can view open jobs
DROP POLICY IF EXISTS "Anyone can view open job postings" ON job_postings;
CREATE POLICY "Anyone can view open job postings"
  ON job_postings FOR SELECT
  USING (status IN ('open', 'in_progress', 'filled'));

-- Organisers can create jobs
DROP POLICY IF EXISTS "Organisers can create jobs" ON job_postings;
CREATE POLICY "Organisers can create jobs"
  ON job_postings FOR INSERT
  WITH CHECK (auth.uid() = organiser_id);

-- Organisers can update their own jobs
DROP POLICY IF EXISTS "Organisers can update own jobs" ON job_postings;
CREATE POLICY "Organisers can update own jobs"
  ON job_postings FOR UPDATE
  USING (auth.uid() = organiser_id);

-- Organisers can delete their own jobs
DROP POLICY IF EXISTS "Organisers can delete own jobs" ON job_postings;
CREATE POLICY "Organisers can delete own jobs"
  ON job_postings FOR DELETE
  USING (auth.uid() = organiser_id);

-- ===== JOB ROLES POLICIES =====

-- Anyone can view roles for open jobs
DROP POLICY IF EXISTS "Anyone can view job roles" ON job_roles;
CREATE POLICY "Anyone can view job roles"
  ON job_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM job_postings
      WHERE job_postings.id = job_roles.job_id
      AND job_postings.status IN ('open', 'in_progress', 'filled')
    )
  );

-- Organisers can manage roles for their jobs
DROP POLICY IF EXISTS "Organisers can manage their job roles" ON job_roles;
CREATE POLICY "Organisers can manage their job roles"
  ON job_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM job_postings
      WHERE job_postings.id = job_roles.job_id
      AND job_postings.organiser_id = auth.uid()
    )
  );

-- ===== JOB APPLICATIONS POLICIES =====

-- Anyone can view applications for jobs they're involved in
DROP POLICY IF EXISTS "View applications for relevant jobs" ON job_applications;
CREATE POLICY "View applications for relevant jobs"
  ON job_applications FOR SELECT
  USING (
    -- Applicant can view their own applications
    auth.uid() = applicant_id
    OR
    -- Organiser can view applications for their jobs
    EXISTS (
      SELECT 1 FROM job_postings
      WHERE job_postings.id = job_applications.job_id
      AND job_postings.organiser_id = auth.uid()
    )
  );

-- Users can create applications
DROP POLICY IF EXISTS "Users can apply to jobs" ON job_applications;
CREATE POLICY "Users can apply to jobs"
  ON job_applications FOR INSERT
  WITH CHECK (auth.uid() = applicant_id);

-- Users can update their own pending applications
DROP POLICY IF EXISTS "Users can update own pending applications" ON job_applications;
CREATE POLICY "Users can update own pending applications"
  ON job_applications FOR UPDATE
  USING (auth.uid() = applicant_id AND status = 'pending');

-- Users can delete their own pending applications
DROP POLICY IF EXISTS "Users can withdraw applications" ON job_applications;
CREATE POLICY "Users can withdraw applications"
  ON job_applications FOR DELETE
  USING (auth.uid() = applicant_id AND status = 'pending');

-- ===== JOB SELECTIONS POLICIES =====

-- Anyone involved can view selections
DROP POLICY IF EXISTS "View selections for relevant jobs" ON job_selections;
CREATE POLICY "View selections for relevant jobs"
  ON job_selections FOR SELECT
  USING (
    -- Selected applicant can view
    auth.uid() = applicant_id
    OR
    -- Organiser can view selections for their jobs
    EXISTS (
      SELECT 1 FROM job_postings
      WHERE job_postings.id = job_selections.job_id
      AND job_postings.organiser_id = auth.uid()
    )
  );

-- Only organisers can create selections
DROP POLICY IF EXISTS "Organisers can create selections" ON job_selections;
CREATE POLICY "Organisers can create selections"
  ON job_selections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_postings
      WHERE job_postings.id = job_selections.job_id
      AND job_postings.organiser_id = auth.uid()
    )
  );

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to check if all roles are filled
CREATE OR REPLACE FUNCTION check_all_roles_filled(job_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) = COUNT(*) FILTER (WHERE filled_count >= quantity)
    FROM job_roles
    WHERE job_id = job_id_param
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_job_postings_updated_at ON job_postings;
CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON job_postings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Migration Complete!
-- ============================================

-- Verify tables created
DO $$
BEGIN
  RAISE NOTICE 'Migration complete! Tables created:';
  RAISE NOTICE '  - job_postings';
  RAISE NOTICE '  - job_roles';
  RAISE NOTICE '  - job_applications';
  RAISE NOTICE '  - job_selections';
  RAISE NOTICE 'RLS policies enabled on all tables';
  RAISE NOTICE 'Ready to create test data!';
END $$;
