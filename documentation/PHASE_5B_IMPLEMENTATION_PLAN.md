# PHASE 5B: Unified Job-Workspace System
## Complete Implementation Plan

**Created:** November 11, 2025
**Status:** Ready to Implement
**Priority:** High
**Estimated Time:** 2-3 weeks

---

## 🎯 Executive Summary

Phase 5B transforms every job posting into a full-featured workspace with project management capabilities. This unified approach means whether a user posts a simple "Need 1 DJ" job or a complex "50-role Festival" job, they get the same powerful management interface.

### Core Principle
**Every Job = A Workspace**

No distinction between "job" and "workspace" - they're the same thing. Jobs start with hiring features and naturally grow to include task management, file sharing, team communication, and expense tracking as the project progresses.

---

## 📊 Current State (Phase 5A)

### ✅ What's Working:
- Job posting creation (3-step form)
- Multi-role system with applications
- Applicant review and selection
- Booking creation on selection
- Studio page with job cards
- JobDetail component with 8 tabs (5 implemented)

### ❌ What's Missing:
- Task management system
- File upload/storage system
- Team messaging system
- Expense tracking (actual spending)
- Real-time collaboration features
- Team member management

### 🗄️ Database Tables (Exist):
- `job_postings` - Core job data
- `job_roles` - Roles within jobs
- `job_applications` - Applications to roles
- `job_selections` - Selected applicants (team members)

---

## 🏗️ Architecture Overview

### Unified Data Model

```
job_postings (existing)
├── Basic workspace info (title, location, dates, budget)
├── Hiring features (roles, applications, selections)
└── NEW: Workspace features
    ├── job_tasks (task management)
    ├── job_files (file storage)
    ├── job_messages (team chat)
    ├── job_expenses (spending tracking)
    └── Team members (derived from job_selections)
```

### Feature Progression Model

```
STAGE 1: HIRING PHASE
Status: 'open'
├── Post job with multiple roles
├── Receive applications
├── Review candidates
├── Select team members
└── Active Tabs: Overview, Applicants, Roles, Budget (planned)

STAGE 2: EXECUTION PHASE
Status: 'in_progress'
├── Selected applicants → Team members
├── Assign tasks to team
├── Share files (contracts, schedules, designs)
├── Track actual expenses vs budget
├── Team communication via messages
└── Active Tabs: ALL 8 tabs (fully unlocked)

STAGE 3: COMPLETION PHASE
Status: 'filled' or 'completed'
├── All roles filled & tasks complete
├── Archive for reference
├── Generate completion reports
└── Option to use as template for future jobs
```

---

## 📦 Phase 5B Deliverables

### 1. Database Schema (4 New Tables)
- `job_tasks` - Task management
- `job_files` - File storage references
- `job_messages` - Team communication
- `job_expenses` - Expense tracking

### 2. API Layer Extensions
- 20+ new API functions in `src/api/jobs.ts`
- Full CRUD for tasks, files, messages, expenses
- Team member queries
- Real-time subscriptions (optional Phase 5C)

### 3. UI Components
- Task management interface
- File upload/download interface
- Team messaging interface
- Expense tracking interface
- Enhanced team member view

### 4. Enhanced Studio Page
- Complete all 8 tabs in JobDetail
- Add workspace features to existing tabs
- Keep one mock workspace as reference

### 5. Documentation
- User guide for workspace features
- API documentation
- Database schema documentation

---

## 🗄️ DATABASE SCHEMA (Detailed)

### Table 1: job_tasks

```sql
-- Task Management for Jobs/Workspaces
CREATE TABLE job_tasks (
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

-- Indexes
CREATE INDEX idx_job_tasks_job_id ON job_tasks(job_id);
CREATE INDEX idx_job_tasks_assigned_to ON job_tasks(assigned_to);
CREATE INDEX idx_job_tasks_status ON job_tasks(status);
CREATE INDEX idx_job_tasks_due_date ON job_tasks(due_date);

-- RLS Policies
ALTER TABLE job_tasks ENABLE ROW LEVEL SECURITY;

-- Organizer + team members can view tasks
CREATE POLICY "Job team can view tasks"
  ON job_tasks FOR SELECT
  USING (
    auth.uid() IN (
      SELECT organiser_id FROM job_postings WHERE id = job_id
      UNION
      SELECT applicant_id FROM job_selections WHERE job_id = job_tasks.job_id
    )
  );

-- Organizer can create tasks
CREATE POLICY "Job organizer can create tasks"
  ON job_tasks FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT organiser_id FROM job_postings WHERE id = job_id)
  );

-- Organizer can update/delete tasks
CREATE POLICY "Job organizer can update tasks"
  ON job_tasks FOR UPDATE
  USING (
    auth.uid() = (SELECT organiser_id FROM job_postings WHERE id = job_id)
  );

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
```

### Table 2: job_files

```sql
-- File Storage for Jobs/Workspaces
CREATE TABLE job_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,

  -- File Details
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL, -- Supabase Storage URL or external URL
  file_type TEXT, -- MIME type (e.g., 'application/pdf', 'image/png')
  file_size INTEGER, -- Size in bytes

  -- Categorization
  category TEXT DEFAULT 'general', -- 'contract', 'design', 'schedule', 'general', etc.
  description TEXT,

  -- Upload Info
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_job_files_job_id ON job_files(job_id);
CREATE INDEX idx_job_files_category ON job_files(category);
CREATE INDEX idx_job_files_uploaded_by ON job_files(uploaded_by);

-- RLS Policies
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
```

### Table 3: job_messages

```sql
-- Team Communication for Jobs/Workspaces
CREATE TABLE job_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,

  -- Message Details
  sender_id UUID NOT NULL REFERENCES profiles(id),
  message TEXT NOT NULL,

  -- Optional: Reply threading
  reply_to UUID REFERENCES job_messages(id) ON DELETE SET NULL,

  -- Optional: Attachments
  attachment_url TEXT,
  attachment_type TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  edited BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_job_messages_job_id ON job_messages(job_id);
CREATE INDEX idx_job_messages_sender_id ON job_messages(sender_id);
CREATE INDEX idx_job_messages_created_at ON job_messages(created_at DESC);
CREATE INDEX idx_job_messages_reply_to ON job_messages(reply_to);

-- RLS Policies
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

-- Sender can edit/delete their own messages
CREATE POLICY "Sender can update own messages"
  ON job_messages FOR UPDATE
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Sender can delete own messages"
  ON job_messages FOR DELETE
  USING (auth.uid() = sender_id);
```

### Table 4: job_expenses

```sql
-- Expense Tracking for Jobs/Workspaces
CREATE TABLE job_expenses (
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

-- Indexes
CREATE INDEX idx_job_expenses_job_id ON job_expenses(job_id);
CREATE INDEX idx_job_expenses_job_role_id ON job_expenses(job_role_id);
CREATE INDEX idx_job_expenses_category ON job_expenses(category);
CREATE INDEX idx_job_expenses_paid_to ON job_expenses(paid_to);

-- RLS Policies
ALTER TABLE job_expenses ENABLE ROW LEVEL SECURITY;

-- Job organizer and team can view expenses
CREATE POLICY "Job team can view expenses"
  ON job_expenses FOR SELECT
  USING (
    auth.uid() IN (
      SELECT organiser_id FROM job_postings WHERE id = job_id
      UNION
      SELECT applicant_id FROM job_selections WHERE job_id = job_expenses.job_id
    )
  );

-- Only organizer can create/update/delete expenses
CREATE POLICY "Job organizer can manage expenses"
  ON job_expenses FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT organiser_id FROM job_postings WHERE id = job_id)
  );

CREATE POLICY "Job organizer can update expenses"
  ON job_expenses FOR UPDATE
  USING (
    auth.uid() = (SELECT organiser_id FROM job_postings WHERE id = job_id)
  );

CREATE POLICY "Job organizer can delete expenses"
  ON job_expenses FOR DELETE
  USING (
    auth.uid() = (SELECT organiser_id FROM job_postings WHERE id = job_id)
  );
```

### Additional: Update Trigger for updated_at

```sql
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all new tables
CREATE TRIGGER update_job_tasks_updated_at
  BEFORE UPDATE ON job_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_messages_updated_at
  BEFORE UPDATE ON job_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_expenses_updated_at
  BEFORE UPDATE ON job_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔌 API LAYER (Detailed)

### File: `src/api/jobs.ts` (Extensions)

Add these functions to the existing `jobs.ts` file:

```typescript
// ============================================
// TASK MANAGEMENT
// ============================================

export interface JobTask {
  id?: string
  job_id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to?: string
  created_by?: string
  due_date?: string
  completed_at?: string
  created_at?: string
  updated_at?: string
  assignee?: any // Joined profile data
  creator?: any // Joined profile data
}

/**
 * Create a new task for a job
 */
export async function createTask(
  jobId: string,
  taskData: Omit<JobTask, 'id' | 'job_id' | 'created_at' | 'updated_at' | 'created_by'>
) {
  try {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('job_tasks')
      .insert({
        job_id: jobId,
        ...taskData,
        created_by: userId
      })
      .select(`
        *,
        assignee:profiles!assigned_to(id, display_name, avatar_url),
        creator:profiles!created_by(id, display_name, avatar_url)
      `)
      .single()

    if (error) throw error

    return {
      success: true,
      data
    }
  } catch (error: any) {
    console.error('Error creating task:', error)
    return {
      success: false,
      error: error.message || 'Failed to create task'
    }
  }
}

/**
 * Get all tasks for a job
 */
export async function getTasksForJob(jobId: string) {
  try {
    const { data, error } = await supabase
      .from('job_tasks')
      .select(`
        *,
        assignee:profiles!assigned_to(id, display_name, avatar_url, role),
        creator:profiles!created_by(id, display_name, avatar_url)
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      success: true,
      data: data || []
    }
  } catch (error: any) {
    console.error('Error fetching tasks:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch tasks',
      data: []
    }
  }
}

/**
 * Update a task
 */
export async function updateTask(
  taskId: string,
  updates: Partial<JobTask>
) {
  try {
    const { data, error } = await supabase
      .from('job_tasks')
      .update(updates)
      .eq('id', taskId)
      .select(`
        *,
        assignee:profiles!assigned_to(id, display_name, avatar_url),
        creator:profiles!created_by(id, display_name, avatar_url)
      `)
      .single()

    if (error) throw error

    return {
      success: true,
      data
    }
  } catch (error: any) {
    console.error('Error updating task:', error)
    return {
      success: false,
      error: error.message || 'Failed to update task'
    }
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string) {
  try {
    const { error } = await supabase
      .from('job_tasks')
      .delete()
      .eq('id', taskId)

    if (error) throw error

    return {
      success: true
    }
  } catch (error: any) {
    console.error('Error deleting task:', error)
    return {
      success: false,
      error: error.message || 'Failed to delete task'
    }
  }
}

// ============================================
// FILE MANAGEMENT
// ============================================

export interface JobFile {
  id?: string
  job_id: string
  file_name: string
  file_url: string
  file_type?: string
  file_size?: number
  category?: string
  description?: string
  uploaded_by?: string
  uploaded_at?: string
  uploader?: any // Joined profile data
}

/**
 * Upload a file for a job (stores in Supabase Storage)
 */
export async function uploadFile(
  jobId: string,
  file: File,
  category: string = 'general',
  description?: string
) {
  try {
    const userId = await getCurrentUserId()

    // 1. Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `job_files/${jobId}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('job-files') // Bucket name: 'job-files'
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // 2. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('job-files')
      .getPublicUrl(filePath)

    // 3. Create database record
    const { data, error } = await supabase
      .from('job_files')
      .insert({
        job_id: jobId,
        file_name: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
        category,
        description,
        uploaded_by: userId
      })
      .select(`
        *,
        uploader:profiles!uploaded_by(id, display_name, avatar_url)
      `)
      .single()

    if (error) throw error

    return {
      success: true,
      data
    }
  } catch (error: any) {
    console.error('Error uploading file:', error)
    return {
      success: false,
      error: error.message || 'Failed to upload file'
    }
  }
}

/**
 * Get all files for a job
 */
export async function getFilesForJob(jobId: string) {
  try {
    const { data, error } = await supabase
      .from('job_files')
      .select(`
        *,
        uploader:profiles!uploaded_by(id, display_name, avatar_url)
      `)
      .eq('job_id', jobId)
      .order('uploaded_at', { ascending: false })

    if (error) throw error

    return {
      success: true,
      data: data || []
    }
  } catch (error: any) {
    console.error('Error fetching files:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch files',
      data: []
    }
  }
}

/**
 * Delete a file
 */
export async function deleteFile(fileId: string) {
  try {
    // 1. Get file info to delete from storage
    const { data: file, error: fetchError } = await supabase
      .from('job_files')
      .select('file_url')
      .eq('id', fileId)
      .single()

    if (fetchError) throw fetchError

    // 2. Extract storage path from URL
    const url = new URL(file.file_url)
    const pathParts = url.pathname.split('/job-files/')
    if (pathParts.length > 1) {
      const storagePath = pathParts[1]

      // 3. Delete from storage
      const { error: storageError } = await supabase.storage
        .from('job-files')
        .remove([storagePath])

      if (storageError) console.error('Storage deletion error:', storageError)
    }

    // 4. Delete database record
    const { error } = await supabase
      .from('job_files')
      .delete()
      .eq('id', fileId)

    if (error) throw error

    return {
      success: true
    }
  } catch (error: any) {
    console.error('Error deleting file:', error)
    return {
      success: false,
      error: error.message || 'Failed to delete file'
    }
  }
}

// ============================================
// MESSAGING
// ============================================

export interface JobMessage {
  id?: string
  job_id: string
  sender_id?: string
  message: string
  reply_to?: string
  attachment_url?: string
  attachment_type?: string
  created_at?: string
  updated_at?: string
  edited?: boolean
  sender?: any // Joined profile data
}

/**
 * Send a message in a job workspace
 */
export async function sendMessage(
  jobId: string,
  message: string,
  replyTo?: string
) {
  try {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('job_messages')
      .insert({
        job_id: jobId,
        sender_id: userId,
        message,
        reply_to: replyTo || null
      })
      .select(`
        *,
        sender:profiles!sender_id(id, display_name, avatar_url, role)
      `)
      .single()

    if (error) throw error

    return {
      success: true,
      data
    }
  } catch (error: any) {
    console.error('Error sending message:', error)
    return {
      success: false,
      error: error.message || 'Failed to send message'
    }
  }
}

/**
 * Get all messages for a job
 */
export async function getMessagesForJob(jobId: string) {
  try {
    const { data, error } = await supabase
      .from('job_messages')
      .select(`
        *,
        sender:profiles!sender_id(id, display_name, avatar_url, role)
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return {
      success: true,
      data: data || []
    }
  } catch (error: any) {
    console.error('Error fetching messages:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch messages',
      data: []
    }
  }
}

/**
 * Update a message (for editing)
 */
export async function updateMessage(
  messageId: string,
  newMessage: string
) {
  try {
    const { data, error } = await supabase
      .from('job_messages')
      .update({
        message: newMessage,
        edited: true
      })
      .eq('id', messageId)
      .select(`
        *,
        sender:profiles!sender_id(id, display_name, avatar_url, role)
      `)
      .single()

    if (error) throw error

    return {
      success: true,
      data
    }
  } catch (error: any) {
    console.error('Error updating message:', error)
    return {
      success: false,
      error: error.message || 'Failed to update message'
    }
  }
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string) {
  try {
    const { error } = await supabase
      .from('job_messages')
      .delete()
      .eq('id', messageId)

    if (error) throw error

    return {
      success: true
    }
  } catch (error: any) {
    console.error('Error deleting message:', error)
    return {
      success: false,
      error: error.message || 'Failed to delete message'
    }
  }
}

// ============================================
// EXPENSE TRACKING
// ============================================

export interface JobExpense {
  id?: string
  job_id: string
  job_role_id?: string
  category: string
  amount: number
  description: string
  paid_to?: string
  payment_method?: string
  paid_at?: string
  receipt_url?: string
  created_by?: string
  created_at?: string
  updated_at?: string
  recipient?: any // Joined profile data
  role?: any // Joined role data
}

/**
 * Add an expense to a job
 */
export async function addExpense(
  jobId: string,
  expenseData: Omit<JobExpense, 'id' | 'job_id' | 'created_by' | 'created_at' | 'updated_at'>
) {
  try {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('job_expenses')
      .insert({
        job_id: jobId,
        ...expenseData,
        created_by: userId
      })
      .select(`
        *,
        recipient:profiles!paid_to(id, display_name, avatar_url),
        role:job_roles!job_role_id(id, role_title, role_type)
      `)
      .single()

    if (error) throw error

    return {
      success: true,
      data
    }
  } catch (error: any) {
    console.error('Error adding expense:', error)
    return {
      success: false,
      error: error.message || 'Failed to add expense'
    }
  }
}

/**
 * Get all expenses for a job
 */
export async function getExpensesForJob(jobId: string) {
  try {
    const { data, error } = await supabase
      .from('job_expenses')
      .select(`
        *,
        recipient:profiles!paid_to(id, display_name, avatar_url),
        role:job_roles!job_role_id(id, role_title, role_type)
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      success: true,
      data: data || []
    }
  } catch (error: any) {
    console.error('Error fetching expenses:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch expenses',
      data: []
    }
  }
}

/**
 * Update an expense
 */
export async function updateExpense(
  expenseId: string,
  updates: Partial<JobExpense>
) {
  try {
    const { data, error } = await supabase
      .from('job_expenses')
      .update(updates)
      .eq('id', expenseId)
      .select(`
        *,
        recipient:profiles!paid_to(id, display_name, avatar_url),
        role:job_roles!job_role_id(id, role_title, role_type)
      `)
      .single()

    if (error) throw error

    return {
      success: true,
      data
    }
  } catch (error: any) {
    console.error('Error updating expense:', error)
    return {
      success: false,
      error: error.message || 'Failed to update expense'
    }
  }
}

/**
 * Delete an expense
 */
export async function deleteExpense(expenseId: string) {
  try {
    const { error } = await supabase
      .from('job_expenses')
      .delete()
      .eq('id', expenseId)

    if (error) throw error

    return {
      success: true
    }
  } catch (error: any) {
    console.error('Error deleting expense:', error)
    return {
      success: false,
      error: error.message || 'Failed to delete expense'
    }
  }
}

// ============================================
// TEAM MANAGEMENT
// ============================================

/**
 * Get all team members for a job
 * (Organizer + all selected applicants)
 */
export async function getTeamMembers(jobId: string) {
  try {
    // Get organizer
    const { data: job, error: jobError } = await supabase
      .from('job_postings')
      .select('organiser_id, organiser:profiles!organiser_id(id, display_name, avatar_url, role, email)')
      .eq('id', jobId)
      .single()

    if (jobError) throw jobError

    // Get selected team members
    const { data: selections, error: selectionsError } = await supabase
      .from('job_selections')
      .select(`
        *,
        applicant:profiles!applicant_id(id, display_name, avatar_url, role, email),
        role:job_roles!job_role_id(id, role_title, role_type)
      `)
      .eq('job_id', jobId)

    if (selectionsError) throw selectionsError

    // Combine organizer and team members
    const teamMembers = [
      {
        id: job.organiser.id,
        ...job.organiser,
        team_role: 'organizer',
        job_role: null
      },
      ...(selections || []).map(s => ({
        id: s.applicant.id,
        ...s.applicant,
        team_role: 'member',
        job_role: s.role
      }))
    ]

    return {
      success: true,
      data: teamMembers
    }
  } catch (error: any) {
    console.error('Error fetching team members:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch team members',
      data: []
    }
  }
}

/**
 * Calculate workspace statistics for a job
 */
export async function getWorkspaceStats(jobId: string) {
  try {
    // Get task stats
    const { data: tasks } = await supabase
      .from('job_tasks')
      .select('status')
      .eq('job_id', jobId)

    const taskStats = {
      total: tasks?.length || 0,
      pending: tasks?.filter(t => t.status === 'pending').length || 0,
      in_progress: tasks?.filter(t => t.status === 'in_progress').length || 0,
      completed: tasks?.filter(t => t.status === 'completed').length || 0
    }

    // Get expense stats
    const { data: expenses } = await supabase
      .from('job_expenses')
      .select('amount')
      .eq('job_id', jobId)

    const totalSpent = expenses?.reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0) || 0

    // Get file count
    const { count: fileCount } = await supabase
      .from('job_files')
      .select('id', { count: 'exact', head: true })
      .eq('job_id', jobId)

    // Get message count
    const { count: messageCount } = await supabase
      .from('job_messages')
      .select('id', { count: 'exact', head: true })
      .eq('job_id', jobId)

    return {
      success: true,
      data: {
        tasks: taskStats,
        totalSpent,
        fileCount: fileCount || 0,
        messageCount: messageCount || 0
      }
    }
  } catch (error: any) {
    console.error('Error fetching workspace stats:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch workspace stats'
    }
  }
}

// Export all new functions
export default {
  // ... existing exports
  createTask,
  getTasksForJob,
  updateTask,
  deleteTask,
  uploadFile,
  getFilesForJob,
  deleteFile,
  sendMessage,
  getMessagesForJob,
  updateMessage,
  deleteMessage,
  addExpense,
  getExpensesForJob,
  updateExpense,
  deleteExpense,
  getTeamMembers,
  getWorkspaceStats
}
```

---

## 📱 UI COMPONENTS (Detailed)

### Component Structure

```
src/components/jobs/
├── (existing files)
├── workspace/
│   ├── TaskManager.jsx           # Task management interface
│   ├── TaskCard.jsx               # Individual task card
│   ├── CreateTaskModal.jsx        # Modal for creating tasks
│   ├── FileManager.jsx            # File upload/list interface
│   ├── FileCard.jsx               # Individual file card
│   ├── MessagePanel.jsx           # Team messaging interface
│   ├── MessageBubble.jsx          # Individual message
│   ├── ExpenseTracker.jsx         # Expense tracking interface
│   ├── ExpenseCard.jsx            # Individual expense card
│   ├── AddExpenseModal.jsx        # Modal for adding expenses
│   └── TeamMembersList.jsx        # Team members view
```

### Implementation Priority

**Phase 5B.1:** Core Features (Week 1)
- Database migration
- API layer implementation
- Task Manager component
- Basic messaging

**Phase 5B.2:** Enhanced Features (Week 2)
- File upload/storage
- Expense tracking
- Team members view
- Enhanced UI/UX

**Phase 5B.3:** Polish (Week 3)
- Real-time updates (optional)
- Notifications
- Search/filter for tasks/files
- Mobile responsiveness

---

## 🎨 MOCK REFERENCE WORKSPACE

Keep this workspace in the codebase as a reference example:

```javascript
// src/components/studio/FunctionalStudioPage.jsx
// Keep one mock workspace for reference/demo purposes

const REFERENCE_WORKSPACE = {
  id: 'mock-reference',
  title: 'Summer Music Festival 2024 [REFERENCE]',
  type: 'Festival',
  date: '2024-08-15',
  location: 'Central Park',
  status: 'In Progress',
  collaborators: 12,
  tasksCompleted: 45,
  totalTasks: 67,
  budget: 25000,
  spent: 18500,
  progress: 67,
  description: 'This is a reference workspace showing what a fully-featured job workspace looks like with tasks, files, messages, and expense tracking.',
  isReference: true // Flag to identify as mock data
}

// Display this prominently in Studio with a badge "Demo/Reference"
// Users can explore it to see what features are available
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 5B.1: Database & API (Week 1)

- [ ] **Day 1-2: Database Migration**
  - [ ] Create migration file with 4 new tables
  - [ ] Add RLS policies
  - [ ] Add indexes
  - [ ] Add update triggers
  - [ ] Test migration locally
  - [ ] Run migration on development database

- [ ] **Day 3-4: API Layer - Tasks**
  - [ ] Implement `createTask()`
  - [ ] Implement `getTasksForJob()`
  - [ ] Implement `updateTask()`
  - [ ] Implement `deleteTask()`
  - [ ] Test all task API functions

- [ ] **Day 5: API Layer - Files & Messages**
  - [ ] Set up Supabase Storage bucket (`job-files`)
  - [ ] Implement `uploadFile()`
  - [ ] Implement `getFilesForJob()`
  - [ ] Implement `deleteFile()`
  - [ ] Implement `sendMessage()`
  - [ ] Implement `getMessagesForJob()`
  - [ ] Test file and message APIs

- [ ] **Day 6: API Layer - Expenses & Team**
  - [ ] Implement `addExpense()`
  - [ ] Implement `getExpensesForJob()`
  - [ ] Implement `updateExpense()`
  - [ ] Implement `deleteExpense()`
  - [ ] Implement `getTeamMembers()`
  - [ ] Implement `getWorkspaceStats()`
  - [ ] Test expense and team APIs

- [ ] **Day 7: Integration Testing**
  - [ ] Test complete API layer
  - [ ] Fix any bugs
  - [ ] Document API functions
  - [ ] Commit Phase 5B.1

### Phase 5B.2: UI Components (Week 2)

- [ ] **Day 8-9: Task Manager**
  - [ ] Create `TaskManager.jsx` component
  - [ ] Create `TaskCard.jsx` component
  - [ ] Create `CreateTaskModal.jsx` component
  - [ ] Integrate with API
  - [ ] Test task creation/update/delete

- [ ] **Day 10-11: Messages Tab**
  - [ ] Create `MessagePanel.jsx` component
  - [ ] Create `MessageBubble.jsx` component
  - [ ] Implement message sending
  - [ ] Implement message display
  - [ ] Add auto-scroll to latest message
  - [ ] Test messaging flow

- [ ] **Day 12-13: Files Tab**
  - [ ] Create `FileManager.jsx` component
  - [ ] Create `FileCard.jsx` component
  - [ ] Implement file upload UI
  - [ ] Implement file list with categories
  - [ ] Add file preview (images, PDFs)
  - [ ] Test file upload/download/delete

- [ ] **Day 14: Testing & Bug Fixes**
  - [ ] Test all new components
  - [ ] Fix UI bugs
  - [ ] Responsive design check
  - [ ] Commit Phase 5B.2

### Phase 5B.3: Enhanced Features (Week 3)

- [ ] **Day 15-16: Expense Tracker**
  - [ ] Create `ExpenseTracker.jsx` component
  - [ ] Create `ExpenseCard.jsx` component
  - [ ] Create `AddExpenseModal.jsx` component
  - [ ] Integrate with Budget tab
  - [ ] Show planned vs actual spending
  - [ ] Test expense tracking

- [ ] **Day 17: Team Members View**
  - [ ] Create `TeamMembersList.jsx` component
  - [ ] Enhance Roles tab with team view
  - [ ] Show task assignments per member
  - [ ] Test team member display

- [ ] **Day 18: Overview Tab Enhancement**
  - [ ] Add workspace stats cards
  - [ ] Show task completion progress
  - [ ] Show budget spent vs remaining
  - [ ] Show recent activity feed

- [ ] **Day 19: Polish & UX**
  - [ ] Add loading states
  - [ ] Add empty states
  - [ ] Add success/error notifications
  - [ ] Improve mobile responsiveness
  - [ ] Add tooltips and help text

- [ ] **Day 20: Reference Workspace**
  - [ ] Keep one mock workspace for demo
  - [ ] Add "Reference" badge
  - [ ] Populate with example data
  - [ ] Make it explorable but read-only

- [ ] **Day 21: Final Testing & Documentation**
  - [ ] End-to-end testing
  - [ ] Create user guide
  - [ ] Update README
  - [ ] Record demo video
  - [ ] Commit Phase 5B.3

---

## 🚀 DEPLOYMENT STEPS

### 1. Database Migration

```bash
# Create new migration file
cd supabase/migrations
touch $(date +%Y%m%d%H%M%S)_add_workspace_features.sql

# Copy Phase 5B schema SQL into the file

# Run migration locally
supabase db reset

# Test locally

# Push to production (when ready)
supabase db push
```

### 2. Storage Bucket Setup

```sql
-- Create storage bucket for job files
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-files', 'job-files', true);

-- Set up storage policies
CREATE POLICY "Job team can view files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'job-files' AND
  auth.uid() IN (
    SELECT organiser_id FROM job_postings
    WHERE id::text = (string_to_array(name, '/'))[2]
    UNION
    SELECT applicant_id FROM job_selections
    WHERE job_id::text = (string_to_array(name, '/'))[2]
  )
);

CREATE POLICY "Job team can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'job-files' AND
  auth.uid() IN (
    SELECT organiser_id FROM job_postings
    WHERE id::text = (string_to_array(name, '/'))[2]
    UNION
    SELECT applicant_id FROM job_selections
    WHERE job_id::text = (string_to_array(name, '/'))[2]
  )
);

CREATE POLICY "Uploader can delete files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'job-files' AND
  auth.uid() = owner
);
```

### 3. Environment Variables

No new environment variables needed. Uses existing Supabase configuration.

### 4. Deployment Checklist

- [ ] Run database migration
- [ ] Set up storage bucket
- [ ] Deploy API changes
- [ ] Deploy UI changes
- [ ] Test on staging
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Announce new features

---

## 📊 SUCCESS METRICS

### User Engagement
- % of jobs that use task management
- % of jobs that upload files
- % of jobs with team messages
- Average tasks per job
- Average files per job

### Feature Adoption
- Task completion rate
- File upload volume
- Message activity
- Expense tracking usage

### System Performance
- API response times < 200ms
- File upload success rate > 99%
- Zero data loss incidents

---

## 🎓 USER GUIDE (Brief)

### For Organisers:

**After posting a job and selecting team members:**

1. **Tasks Tab**: Assign work to team members
   - Click "Add Task"
   - Set title, assignee, due date, priority
   - Track completion status

2. **Files Tab**: Share important documents
   - Click "Upload File"
   - Choose category (contract, design, schedule, etc.)
   - Team can view/download

3. **Messages Tab**: Communicate with your team
   - Type message and press send
   - Real-time conversation with all team members
   - Keep all project communication in one place

4. **Budget Tab**: Track actual spending
   - See planned budget by role
   - Add expenses as they occur
   - Compare planned vs actual

5. **Roles Tab**: View your team
   - See all hired team members
   - View tasks assigned to each person
   - Contact information

---

## 📝 NOTES & CONSIDERATIONS

### Security
- All RLS policies ensure only job team can access workspace features
- File uploads stored securely in Supabase Storage
- No sensitive data in public URLs

### Scalability
- Indexed queries for performance
- Pagination can be added for large message/task lists
- File size limits (configurable, recommend 10MB per file)

### Future Enhancements (Phase 5C)
- Real-time updates using Supabase Realtime
- Push notifications for task assignments
- Email notifications for messages
- Task templates
- Recurring tasks
- File versioning
- Message read receipts
- @mentions in messages
- Task dependencies
- Gantt chart view

### Mobile Considerations
- All components should be responsive
- Touch-friendly interfaces
- Optimized for smaller screens
- Consider React Native app later

---

## 🆘 TROUBLESHOOTING

### Common Issues

**Issue: RLS policies blocking access**
- Solution: Verify user is organizer or selected team member
- Check `job_selections` table has correct records

**Issue: File upload failing**
- Solution: Check storage bucket exists and policies are set
- Verify file size under limit
- Check CORS settings if browser error

**Issue: Messages not appearing**
- Solution: Check RLS policies on `job_messages`
- Verify sender_id matches auth.uid()
- Check query ordering

**Issue: Tasks not loading**
- Solution: Verify foreign key relationships
- Check `job_id` is correct UUID
- Confirm task exists in database

---

## ✅ DEFINITION OF DONE

Phase 5B is complete when:

1. ✅ All 4 database tables created and migrated
2. ✅ All 20+ API functions implemented and tested
3. ✅ All 8 tabs in JobDetail fully functional
4. ✅ Tasks can be created, assigned, updated, completed, deleted
5. ✅ Files can be uploaded, viewed, downloaded, deleted
6. ✅ Messages can be sent, viewed, edited, deleted
7. ✅ Expenses can be tracked and categorized
8. ✅ Team members automatically populated from selections
9. ✅ Reference workspace visible for demo purposes
10. ✅ All features tested end-to-end
11. ✅ Documentation complete
12. ✅ No critical bugs
13. ✅ Mobile responsive
14. ✅ Performance meets targets
15. ✅ Deployed to production

---

## 📅 TIMELINE SUMMARY

| Week | Focus | Deliverables |
|------|-------|-------------|
| Week 1 | Database & API | 4 tables, 20+ API functions, tested |
| Week 2 | Core UI | Tasks, Messages, Files components |
| Week 3 | Polish | Expenses, Team view, UX improvements |

**Total Duration:** 3 weeks (21 days)
**Team Size:** 1-2 developers
**Complexity:** Medium-High

---

**END OF PHASE 5B IMPLEMENTATION PLAN**

*Ready to build! 🚀*
