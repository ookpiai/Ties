-- ============================================
-- TIES Together - Phase 5B: Workspace Features
-- Migration: Add Task Management, File Storage, Messaging, and Expense Tracking
-- Created: 2025-11-11
-- ============================================

-- This migration adds workspace features to job postings, making every job
-- a full-featured project management workspace.

-- ============================================
-- TABLE 1: JOB TASKS (Task Management)
-- ============================================

CREATE TABLE IF NOT EXISTS job_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,

  -- Task Details
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  -- Assignment
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),

  -- Timing
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for job_tasks
CREATE INDEX idx_job_tasks_job_id ON job_tasks(job_id);
CREATE INDEX idx_job_tasks_assigned_to ON job_tasks(assigned_to);
CREATE INDEX idx_job_tasks_status ON job_tasks(status);
CREATE INDEX idx_job_tasks_due_date ON job_tasks(due_date);

-- RLS for job_tasks
ALTER TABLE job_tasks ENABLE ROW LEVEL SECURITY;

-- Job team (organizer + selected members) can view tasks
CREATE POLICY "Job team can view tasks"
  ON job_tasks FOR SELECT
  USING (
    auth.uid() IN (
      SELECT organiser_id FROM job_postings WHERE id = job_id
      UNION
      SELECT applicant_id FROM job_selections WHERE job_id = job_tasks.job_id
    )
  );

-- Job organizer can create tasks
CREATE POLICY "Job organizer can create tasks"
  ON job_tasks FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT organiser_id FROM job_postings WHERE id = job_id)
  );

-- Job organizer can update tasks
CREATE POLICY "Job organizer can update tasks"
  ON job_tasks FOR UPDATE
  USING (
    auth.uid() = (SELECT organiser_id FROM job_postings WHERE id = job_id)
  );

-- Job organizer can delete tasks
CREATE POLICY "Job organizer can delete tasks"
  ON job_tasks FOR DELETE
  USING (
    auth.uid() = (SELECT organiser_id FROM job_postings WHERE id = job_id)
  );

-- Assigned team members can update their own task status
CREATE POLICY "Assigned member can update task status"
  ON job_tasks FOR UPDATE
  USING (auth.uid() = assigned_to)
  WITH CHECK (auth.uid() = assigned_to);

-- ============================================
-- TABLE 2: JOB FILES (File Storage)
-- ============================================

CREATE TABLE IF NOT EXISTS job_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,

  -- File Details
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL, -- Supabase Storage URL
  file_type TEXT, -- MIME type (e.g., 'application/pdf', 'image/png')
  file_size INTEGER, -- Size in bytes

  -- Categorization
  category TEXT DEFAULT 'general', -- 'contract', 'design', 'schedule', 'general', etc.
  description TEXT,

  -- Upload Info
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for job_files
CREATE INDEX idx_job_files_job_id ON job_files(job_id);
CREATE INDEX idx_job_files_category ON job_files(category);
CREATE INDEX idx_job_files_uploaded_by ON job_files(uploaded_by);

-- RLS for job_files
ALTER TABLE job_files ENABLE ROW LEVEL SECURITY;

-- Job team can view files
CREATE POLICY "Job team can view files"
  ON job_files FOR SELECT
  USING (
    auth.uid() IN (
      SELECT organiser_id FROM job_postings WHERE id = job_id
      UNION
      SELECT applicant_id FROM job_selections WHERE job_id = job_files.job_id
    )
  );

-- Job team can upload files
CREATE POLICY "Job team can upload files"
  ON job_files FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT organiser_id FROM job_postings WHERE id = job_id
      UNION
      SELECT applicant_id FROM job_selections WHERE job_id = job_files.job_id
    )
  );

-- Only uploader or organizer can delete files
CREATE POLICY "Uploader or organizer can delete files"
  ON job_files FOR DELETE
  USING (
    auth.uid() = uploaded_by OR
    auth.uid() = (SELECT organiser_id FROM job_postings WHERE id = job_id)
  );

-- ============================================
-- TABLE 3: JOB MESSAGES (Team Communication)
-- ============================================

CREATE TABLE IF NOT EXISTS job_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,

  -- Message Details
  sender_id UUID NOT NULL REFERENCES profiles(id),
  message TEXT NOT NULL,

  -- Threading (optional)
  thread TEXT DEFAULT 'general', -- 'general', or role-specific thread
  reply_to UUID REFERENCES job_messages(id) ON DELETE SET NULL,

  -- Attachments (optional)
  attachment_url TEXT,
  attachment_type TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  edited BOOLEAN DEFAULT FALSE
);

-- Indexes for job_messages
CREATE INDEX idx_job_messages_job_id ON job_messages(job_id);
CREATE INDEX idx_job_messages_sender_id ON job_messages(sender_id);
CREATE INDEX idx_job_messages_thread ON job_messages(thread);
CREATE INDEX idx_job_messages_created_at ON job_messages(created_at DESC);
CREATE INDEX idx_job_messages_reply_to ON job_messages(reply_to);

-- RLS for job_messages
ALTER TABLE job_messages ENABLE ROW LEVEL SECURITY;

-- Job team can view messages
CREATE POLICY "Job team can view messages"
  ON job_messages FOR SELECT
  USING (
    auth.uid() IN (
      SELECT organiser_id FROM job_postings WHERE id = job_id
      UNION
      SELECT applicant_id FROM job_selections WHERE job_id = job_messages.job_id
    )
  );

-- Job team can send messages
CREATE POLICY "Job team can send messages"
  ON job_messages FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT organiser_id FROM job_postings WHERE id = job_id
      UNION
      SELECT applicant_id FROM job_selections WHERE job_id = job_messages.job_id
    ) AND
    auth.uid() = sender_id
  );

-- Sender can edit their own messages
CREATE POLICY "Sender can update own messages"
  ON job_messages FOR UPDATE
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

-- Sender can delete their own messages
CREATE POLICY "Sender can delete own messages"
  ON job_messages FOR DELETE
  USING (auth.uid() = sender_id);

-- ============================================
-- TABLE 4: JOB EXPENSES (Budget Tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS job_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,

  -- Optional: Link to specific role budget
  job_role_id UUID REFERENCES job_roles(id) ON DELETE SET NULL,

  -- Expense Details
  category TEXT NOT NULL, -- 'labor', 'equipment', 'venue', 'catering', 'other', etc.
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,

  -- Payment Info
  paid_to UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Who received payment
  payment_method TEXT, -- 'bank_transfer', 'cash', 'card', etc.
  paid_at TIMESTAMPTZ,

  -- Receipt/Invoice
  receipt_url TEXT, -- Link to receipt/invoice file

  -- Metadata
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for job_expenses
CREATE INDEX idx_job_expenses_job_id ON job_expenses(job_id);
CREATE INDEX idx_job_expenses_job_role_id ON job_expenses(job_role_id);
CREATE INDEX idx_job_expenses_category ON job_expenses(category);
CREATE INDEX idx_job_expenses_paid_to ON job_expenses(paid_to);

-- RLS for job_expenses
ALTER TABLE job_expenses ENABLE ROW LEVEL SECURITY;

-- Job team can view expenses
CREATE POLICY "Job team can view expenses"
  ON job_expenses FOR SELECT
  USING (
    auth.uid() IN (
      SELECT organiser_id FROM job_postings WHERE id = job_id
      UNION
      SELECT applicant_id FROM job_selections WHERE job_id = job_expenses.job_id
    )
  );

-- Only organizer can create expenses
CREATE POLICY "Job organizer can manage expenses"
  ON job_expenses FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT organiser_id FROM job_postings WHERE id = job_id)
  );

-- Only organizer can update expenses
CREATE POLICY "Job organizer can update expenses"
  ON job_expenses FOR UPDATE
  USING (
    auth.uid() = (SELECT organiser_id FROM job_postings WHERE id = job_id)
  );

-- Only organizer can delete expenses
CREATE POLICY "Job organizer can delete expenses"
  ON job_expenses FOR DELETE
  USING (
    auth.uid() = (SELECT organiser_id FROM job_postings WHERE id = job_id)
  );

-- ============================================
-- TRIGGERS: Auto-update timestamps
-- ============================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to job_tasks
CREATE TRIGGER update_job_tasks_updated_at
  BEFORE UPDATE ON job_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to job_messages
CREATE TRIGGER update_job_messages_updated_at
  BEFORE UPDATE ON job_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to job_expenses
CREATE TRIGGER update_job_expenses_updated_at
  BEFORE UPDATE ON job_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE job_tasks IS 'Task management for job workspaces. Allows organizers to assign work to team members.';
COMMENT ON TABLE job_files IS 'File storage references for job workspaces. Actual files stored in Supabase Storage.';
COMMENT ON TABLE job_messages IS 'Team messaging system for job workspaces with thread support.';
COMMENT ON TABLE job_expenses IS 'Expense tracking for jobs to compare actual spending vs planned budget.';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Phase 5B workspace features successfully added to job system.
-- Jobs now have full project management capabilities:
-- - Task assignment and tracking
-- - File sharing and storage
-- - Team messaging with threads
-- - Budget tracking with expense management
