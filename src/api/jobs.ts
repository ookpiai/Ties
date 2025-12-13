// TIES Together - Jobs API Layer
// Phase 5: Multi-Role Job Posting System

import { supabase } from '../lib/supabase'
import {
  sendApplicationReceivedEmail,
  sendApplicationSelectedEmail,
  sendApplicationRejectedEmail
} from './emails'

// ============================================
// TYPES
// ============================================

export interface JobRole {
  id?: string
  job_id?: string
  role_type: 'freelancer' | 'venue' | 'vendor'
  role_title: string
  role_description?: string
  budget: number
  quantity?: number
  filled_count?: number
  created_at?: string
}

export interface JobPosting {
  id?: string
  organiser_id?: string
  title: string
  description: string
  location?: string
  event_type?: string
  start_date: string
  end_date: string
  total_budget?: number
  status?: 'open' | 'in_progress' | 'filled' | 'cancelled'
  application_deadline?: string
  created_at?: string
  updated_at?: string
  roles?: JobRole[] // Joined data
  organiser?: any // Profile data
  application_count?: number
}

export interface JobApplication {
  id?: string
  job_id: string
  job_role_id: string
  applicant_id?: string
  cover_letter?: string
  proposed_rate?: number
  portfolio_links?: string[]
  status?: 'pending' | 'selected' | 'rejected' | 'withdrawn'
  created_at?: string
  role?: JobRole // Joined data
  job?: JobPosting // Joined data
  applicant?: any // Profile data
}

export interface JobSelection {
  id?: string
  job_id: string
  job_role_id: string
  application_id: string
  applicant_id: string
  booking_id?: string
  selected_at?: string
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

// ============================================
// JOB POSTING MANAGEMENT
// ============================================

/**
 * Create a new job posting with roles
 */
export async function createJobPosting(
  jobData: Omit<JobPosting, 'id' | 'created_at' | 'updated_at' | 'status' | 'organiser_id'>,
  roles: Omit<JobRole, 'id' | 'job_id' | 'created_at' | 'filled_count'>[]
) {
  try {
    const userId = await getCurrentUserId()

    // Calculate total budget from roles if not provided
    const totalBudget = jobData.total_budget || roles.reduce((sum, role) => sum + (role.budget || 0), 0)

    // 1. Create job posting
    const { data: job, error: jobError } = await supabase
      .from('job_postings')
      .insert({
        ...jobData,
        organiser_id: userId,
        total_budget: totalBudget,
        status: 'open'
      })
      .select()
      .single()

    if (jobError) throw jobError
    if (!job) throw new Error('Failed to create job posting')

    // 2. Create roles for this job
    const rolesWithJobId = roles.map(role => ({
      ...role,
      job_id: job.id,
      filled_count: 0
    }))

    const { data: createdRoles, error: rolesError } = await supabase
      .from('job_roles')
      .insert(rolesWithJobId)
      .select()

    if (rolesError) throw rolesError

    return {
      success: true,
      data: {
        ...job,
        roles: createdRoles
      }
    }
  } catch (error: any) {
    console.error('Error creating job posting:', error)
    return {
      success: false,
      error: error.message || 'Failed to create job posting'
    }
  }
}

/**
 * Get all job postings with filters
 */
export async function getJobPostings(filters?: {
  role_type?: string
  location?: string
  status?: string
  min_budget?: number
  max_budget?: number
}) {
  try {
    let query = supabase
      .from('job_postings')
      .select(`
        *,
        organiser:profiles!organiser_id(id, display_name, avatar_url, role),
        roles:job_roles(*)
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status)
    } else {
      // Default: show only open and in_progress jobs
      query = query.in('status', ['open', 'in_progress'])
    }

    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`)
    }

    const { data, error } = await query

    if (error) throw error

    // Filter by role_type if specified (client-side filter on joined roles)
    let filteredData = data
    if (filters?.role_type) {
      filteredData = data?.filter(job =>
        job.roles?.some((role: JobRole) => role.role_type === filters.role_type)
      )
    }

    // Filter by budget if specified
    if (filters?.min_budget || filters?.max_budget) {
      filteredData = filteredData?.filter(job => {
        const budget = job.total_budget || 0
        if (filters.min_budget && budget < filters.min_budget) return false
        if (filters.max_budget && budget > filters.max_budget) return false
        return true
      })
    }

    return {
      success: true,
      data: filteredData || []
    }
  } catch (error: any) {
    console.error('Error fetching job postings:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch job postings',
      data: []
    }
  }
}

/**
 * Get jobs created by the current user (as organizer)
 * Used for calendar and studio views
 */
export async function getMyJobs() {
  try {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('job_postings')
      .select(`
        *,
        roles:job_roles(*),
        applications:job_applications(count)
      `)
      .eq('organiser_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error: any) {
    console.error('Error fetching my jobs:', error)
    return []
  }
}

/**
 * Get jobs the current user has applied to
 * Returns applications with full job data for calendar display
 */
export async function getAppliedJobs() {
  try {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        job_posting:job_postings!job_id(
          id,
          title,
          description,
          location,
          event_type,
          start_date,
          end_date,
          total_budget,
          status,
          organiser:profiles!organiser_id(id, display_name, avatar_url)
        ),
        role:job_roles!job_role_id(*)
      `)
      .eq('applicant_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error: any) {
    console.error('Error fetching applied jobs:', error)
    return []
  }
}

/**
 * Get a single job posting by ID with all details
 */
export async function getJobPostingById(jobId: string) {
  try {
    const { data, error } = await supabase
      .from('job_postings')
      .select(`
        *,
        organiser:profiles!organiser_id(id, display_name, avatar_url, role, bio, city),
        roles:job_roles(*),
        applications:job_applications(
          *,
          applicant:profiles!applicant_id(id, display_name, avatar_url, role)
        )
      `)
      .eq('id', jobId)
      .single()

    if (error) throw error

    // Count applications per role
    const rolesWithCounts = data?.roles?.map((role: any) => ({
      ...role,
      application_count: data.applications?.filter((app: any) => app.job_role_id === role.id).length || 0
    }))

    return {
      success: true,
      data: {
        ...data,
        roles: rolesWithCounts,
        application_count: data.applications?.length || 0
      }
    }
  } catch (error: any) {
    console.error('Error fetching job posting:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch job posting'
    }
  }
}

/**
 * Update a job posting (organiser only)
 */
export async function updateJobPosting(jobId: string, updates: Partial<JobPosting>) {
  try {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('job_postings')
      .update(updates)
      .eq('id', jobId)
      .eq('organiser_id', userId) // RLS will enforce this too
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      data
    }
  } catch (error: any) {
    console.error('Error updating job posting:', error)
    return {
      success: false,
      error: error.message || 'Failed to update job posting'
    }
  }
}

/**
 * Cancel a job posting
 */
export async function cancelJobPosting(jobId: string, reason?: string) {
  try {
    return await updateJobPosting(jobId, { status: 'cancelled' })
  } catch (error: any) {
    console.error('Error cancelling job posting:', error)
    return {
      success: false,
      error: error.message || 'Failed to cancel job posting'
    }
  }
}

// ============================================
// JOB APPLICATIONS
// ============================================

/**
 * Apply to a specific role in a job
 */
export async function applyToJobRole(
  jobId: string,
  roleId: string,
  applicationData: {
    cover_letter?: string
    proposed_rate?: number
    portfolio_links?: string[]
  }
) {
  try {
    const userId = await getCurrentUserId()

    // Check if user is the organiser of this job
    const { data: job, error: jobError } = await supabase
      .from('job_postings')
      .select('organiser_id')
      .eq('id', jobId)
      .single()

    if (jobError) throw jobError

    if (job.organiser_id === userId) {
      throw new Error('You cannot apply to your own job posting')
    }

    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        job_id: jobId,
        job_role_id: roleId,
        applicant_id: userId,
        ...applicationData,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('You have already applied to this role')
      }
      throw error
    }

    // Send email notification to organiser
    try {
      const { data: organiserProfile } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', job.organiser_id)
        .single()

      const { data: applicantProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', userId)
        .single()

      const { data: jobDetails } = await supabase
        .from('job_postings')
        .select('title')
        .eq('id', jobId)
        .single()

      const { data: roleDetails } = await supabase
        .from('job_roles')
        .select('role_title')
        .eq('id', roleId)
        .single()

      if (organiserProfile && applicantProfile && jobDetails && roleDetails) {
        await sendApplicationReceivedEmail({
          organiserEmail: organiserProfile.email,
          organiserName: organiserProfile.display_name,
          applicantName: applicantProfile.display_name,
          jobTitle: jobDetails.title,
          roleName: roleDetails.role_title,
          appliedDate: new Date().toLocaleDateString('en-AU', {
            month: 'long', day: 'numeric', year: 'numeric'
          }),
          applicationUrl: `${window.location.origin}/jobs/${jobId}/applicants`
        })
        console.log('✅ Application received email sent to organiser')
      }
    } catch (emailError) {
      console.error('⚠️ Failed to send application received email:', emailError)
      // Don't throw - application is still submitted
    }

    return {
      success: true,
      data
    }
  } catch (error: any) {
    console.error('Error applying to job:', error)
    return {
      success: false,
      error: error.message || 'Failed to apply to job'
    }
  }
}

/**
 * Get applications for a job (organiser only)
 */
export async function getApplicationsForJob(jobId: string) {
  try {
    const userId = await getCurrentUserId()

    // Verify user is the organiser
    const { data: job } = await supabase
      .from('job_postings')
      .select('organiser_id')
      .eq('id', jobId)
      .single()

    if (job?.organiser_id !== userId) {
      throw new Error('Unauthorized: Only the job organiser can view applications')
    }

    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        role:job_roles!job_role_id(*),
        applicant:profiles!applicant_id(id, display_name, avatar_url, role, bio, city, skills, portfolio_urls)
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      success: true,
      data: data || []
    }
  } catch (error: any) {
    console.error('Error fetching applications:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch applications',
      data: []
    }
  }
}

/**
 * Get user's own applications
 */
export async function getMyApplications() {
  try {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        job:job_postings!job_id(*),
        role:job_roles!job_role_id(*)
      `)
      .eq('applicant_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      success: true,
      data: data || []
    }
  } catch (error: any) {
    console.error('Error fetching my applications:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch applications',
      data: []
    }
  }
}

/**
 * Get jobs where the current user has been accepted (selected)
 * These are the jobs that appear in Studio for project management
 */
export async function getMyAcceptedJobs() {
  try {
    const userId = await getCurrentUserId()

    // Get applications where user was selected
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        job:job_postings!job_id(
          *,
          organiser:profiles!organiser_id(id, display_name, avatar_url, role, email),
          roles:job_roles(*)
        ),
        role:job_roles!job_role_id(*)
      `)
      .eq('applicant_id', userId)
      .eq('status', 'selected')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transform data to return job-centric view with user's role info
    const acceptedJobs = data?.map(application => ({
      ...application.job,
      my_role: application.role,
      my_application: {
        id: application.id,
        proposed_rate: application.proposed_rate,
        cover_letter: application.cover_letter,
        created_at: application.created_at
      }
    })) || []

    return {
      success: true,
      data: acceptedJobs
    }
  } catch (error: any) {
    console.error('Error fetching my accepted jobs:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch accepted jobs',
      data: []
    }
  }
}

/**
 * Reject an applicant (organiser only)
 */
export async function rejectApplicant(applicationId: string, reason?: string) {
  try {
    const userId = await getCurrentUserId()

    // 1. Get application details
    const { data: application, error: appError } = await supabase
      .from('job_applications')
      .select(`
        *,
        job:job_postings!job_id(organiser_id, title),
        role:job_roles!job_role_id(role_title)
      `)
      .eq('id', applicationId)
      .single()

    if (appError) throw appError
    if (!application) throw new Error('Application not found')

    // 2. Verify user is the organiser
    if (application.job.organiser_id !== userId) {
      throw new Error('Unauthorized: Only the job organiser can reject applicants')
    }

    // 3. Check if application is pending
    if (application.status !== 'pending') {
      throw new Error('Can only reject pending applications')
    }

    // 4. Update application status to 'rejected'
    const { data, error: updateError } = await supabase
      .from('job_applications')
      .update({
        status: 'rejected',
        // Store reason in a metadata field if needed in future
      })
      .eq('id', applicationId)
      .select()
      .single()

    if (updateError) throw updateError

    // 5. Send rejection email notification (optional)
    try {
      const { data: applicantProfile } = await supabase
        .from('profiles')
        .select('email, display_name')
        .eq('id', application.applicant_id)
        .single()

      if (applicantProfile?.email) {
        await sendApplicationRejectedEmail({
          applicantEmail: applicantProfile.email,
          applicantName: applicantProfile.display_name,
          jobTitle: application.job.title,
          roleName: application.role.role_title
        })
        console.log('✅ Rejection email sent to applicant')
      }
    } catch (emailError) {
      console.error('⚠️ Failed to send rejection email:', emailError)
      // Don't throw - rejection is still successful
    }

    return {
      success: true,
      data
    }
  } catch (error: any) {
    console.error('Error rejecting applicant:', error)
    return {
      success: false,
      error: error.message || 'Failed to reject applicant'
    }
  }
}

/**
 * Withdraw an application
 */
export async function withdrawApplication(applicationId: string) {
  try {
    const userId = await getCurrentUserId()

    const { data, error } = await supabase
      .from('job_applications')
      .update({ status: 'withdrawn' })
      .eq('id', applicationId)
      .eq('applicant_id', userId)
      .eq('status', 'pending') // Can only withdraw pending applications
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      data
    }
  } catch (error: any) {
    console.error('Error withdrawing application:', error)
    return {
      success: false,
      error: error.message || 'Failed to withdraw application'
    }
  }
}

// ============================================
// SELECTION & BOOKING CREATION
// ============================================

/**
 * Select an applicant for a role (creates booking automatically)
 */
export async function selectApplicant(applicationId: string) {
  try {
    const userId = await getCurrentUserId()

    // 1. Get application details
    const { data: application, error: appError } = await supabase
      .from('job_applications')
      .select(`
        *,
        job:job_postings!job_id(*),
        role:job_roles!job_role_id(*)
      `)
      .eq('id', applicationId)
      .single()

    if (appError) throw appError
    if (!application) throw new Error('Application not found')

    // 2. Verify user is the organiser
    if (application.job.organiser_id !== userId) {
      throw new Error('Unauthorized: Only the job organiser can select applicants')
    }

    // 3. Check if role is already filled
    if (application.role.filled_count >= application.role.quantity) {
      throw new Error('This role has already been filled')
    }

    // 4. Update application status to 'selected'
    const { error: updateError } = await supabase
      .from('job_applications')
      .update({ status: 'selected' })
      .eq('id', applicationId)

    if (updateError) throw updateError

    // 5. Create booking (using Phase 4A booking system)
    const { createBooking } = await import('./bookings')
    const booking = await createBooking({
      freelancer_id: application.applicant_id,
      start_date: new Date(application.job.start_date),
      end_date: new Date(application.job.end_date),
      total_amount: application.proposed_rate || application.role.budget,
      service_description: `${application.role.role_title} for ${application.job.title}`,
      client_message: `Selected from job posting: ${application.job.title}`
    })

    if (!booking) {
      throw new Error('Failed to create booking')
    }

    // 6. Create selection record
    const { data: selection, error: selectionError } = await supabase
      .from('job_selections')
      .insert({
        job_id: application.job_id,
        job_role_id: application.job_role_id,
        application_id: applicationId,
        applicant_id: application.applicant_id,
        booking_id: booking.id
      })
      .select()
      .single()

    if (selectionError) throw selectionError

    // 7. Increment filled_count for role
    const { error: roleUpdateError } = await supabase
      .from('job_roles')
      .update({ filled_count: application.role.filled_count + 1 })
      .eq('id', application.job_role_id)

    if (roleUpdateError) throw roleUpdateError

    // 8. Reject other applicants for this role
    const { error: rejectError } = await supabase
      .from('job_applications')
      .update({ status: 'rejected' })
      .eq('job_role_id', application.job_role_id)
      .eq('status', 'pending')
      .neq('id', applicationId)

    if (rejectError) console.error('Error rejecting other applicants:', rejectError)

    // 9. Check if all roles are filled
    const { data: allRoles } = await supabase
      .from('job_roles')
      .select('id, filled_count, quantity')
      .eq('job_id', application.job_id)

    const allFilled = allRoles?.every(role => role.filled_count >= role.quantity)

    // 10. Update job status if all roles filled
    if (allFilled) {
      await supabase
        .from('job_postings')
        .update({ status: 'filled' })
        .eq('id', application.job_id)
    } else {
      // At least one role filled, mark as in_progress if still open
      await supabase
        .from('job_postings')
        .update({ status: 'in_progress' })
        .eq('id', application.job_id)
        .eq('status', 'open')
    }

    return {
      success: true,
      data: {
        selection,
        booking,
        allRolesFilled: allFilled
      }
    }
  } catch (error: any) {
    console.error('Error selecting applicant:', error)
    return {
      success: false,
      error: error.message || 'Failed to select applicant'
    }
  }
}

/**
 * Check if all roles in a job are filled
 */
export async function checkAllRolesFilled(jobId: string) {
  try {
    const { data: roles, error } = await supabase
      .from('job_roles')
      .select('id, filled_count, quantity')
      .eq('job_id', jobId)

    if (error) throw error

    const allFilled = roles?.every(role => role.filled_count >= role.quantity)

    return {
      success: true,
      allFilled,
      roles
    }
  } catch (error: any) {
    console.error('Error checking roles filled:', error)
    return {
      success: false,
      error: error.message || 'Failed to check roles status'
    }
  }
}

// ============================================
// PHASE 5B: WORKSPACE FEATURES
// ============================================

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
        assignee:profiles!assigned_to(id, display_name, avatar_url, role),
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
    const { data, error} = await supabase
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
        assignee:profiles!assigned_to(id, display_name, avatar_url, role),
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
      .from('job-files')
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
  thread?: string
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
  thread: string = 'general',
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
        thread,
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
 * Get all messages for a job (optionally filtered by thread)
 */
export async function getMessagesForJob(jobId: string, thread?: string) {
  try {
    let query = supabase
      .from('job_messages')
      .select(`
        *,
        sender:profiles!sender_id(id, display_name, avatar_url, role)
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: true })

    if (thread) {
      query = query.eq('thread', thread)
    }

    const { data, error } = await query

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
        job_role: null,
        permissions: 'admin'
      },
      ...(selections || []).map(s => ({
        id: s.applicant.id,
        ...s.applicant,
        team_role: 'member',
        job_role: s.role,
        permissions: 'editor'
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

// ============================================
// PHASE 5C: JOB EDITING - ROLE MANAGEMENT
// ============================================

/**
 * Add a new role to an existing job
 */
export async function addRoleToJob(
  jobId: string,
  roleData: Omit<JobRole, 'id' | 'job_id' | 'created_at' | 'filled_count'>
) {
  try {
    const userId = await getCurrentUserId()

    // Verify user is the job organizer
    const { data: job, error: jobError } = await supabase
      .from('job_postings')
      .select('organiser_id, total_budget')
      .eq('id', jobId)
      .single()

    if (jobError) throw jobError
    if (job.organiser_id !== userId) {
      throw new Error('Only the job organizer can add roles')
    }

    // Insert the new role
    const { data, error } = await supabase
      .from('job_roles')
      .insert({
        job_id: jobId,
        ...roleData,
        filled_count: 0
      })
      .select()
      .single()

    if (error) throw error

    // Update job total_budget
    const newTotalBudget = (job.total_budget || 0) + roleData.budget
    await supabase
      .from('job_postings')
      .update({ total_budget: newTotalBudget })
      .eq('id', jobId)

    return { success: true, data }
  } catch (error: any) {
    console.error('Error adding role to job:', error)
    return {
      success: false,
      error: error.message || 'Failed to add role to job'
    }
  }
}

/**
 * Update an existing role
 */
export async function updateJobRole(
  roleId: string,
  updates: Partial<Omit<JobRole, 'id' | 'job_id' | 'created_at'>>
) {
  try {
    const userId = await getCurrentUserId()

    // Get the role and verify permissions
    const { data: role, error: roleError } = await supabase
      .from('job_roles')
      .select('*, job:job_postings!inner(organiser_id, total_budget)')
      .eq('id', roleId)
      .single()

    if (roleError) throw roleError
    if (role.job.organiser_id !== userId) {
      throw new Error('Only the job organizer can update roles')
    }

    // Check if quantity is being reduced below filled_count
    if (updates.quantity !== undefined && updates.quantity < (role.filled_count || 0)) {
      throw new Error(`Cannot reduce quantity below filled positions (${role.filled_count})`)
    }

    // Calculate budget difference if budget is being updated
    let budgetDiff = 0
    if (updates.budget !== undefined) {
      budgetDiff = updates.budget - role.budget
    }

    // Update the role
    const { data, error } = await supabase
      .from('job_roles')
      .update(updates)
      .eq('id', roleId)
      .select()
      .single()

    if (error) throw error

    // Update job total_budget if budget changed
    if (budgetDiff !== 0) {
      const newTotalBudget = (role.job.total_budget || 0) + budgetDiff
      await supabase
        .from('job_postings')
        .update({ total_budget: newTotalBudget })
        .eq('id', role.job_id)
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error updating job role:', error)
    return {
      success: false,
      error: error.message || 'Failed to update job role'
    }
  }
}

/**
 * Delete a role from a job
 */
export async function deleteJobRole(roleId: string) {
  try {
    const userId = await getCurrentUserId()

    // Get the role and check permissions
    const { data: role, error: roleError } = await supabase
      .from('job_roles')
      .select('*, job:job_postings!inner(organiser_id, total_budget)')
      .eq('id', roleId)
      .single()

    if (roleError) throw roleError
    if (role.job.organiser_id !== userId) {
      throw new Error('Only the job organizer can delete roles')
    }

    // Check if role has applicants
    const { count: applicantCount } = await supabase
      .from('job_applications')
      .select('id', { count: 'exact', head: true })
      .eq('job_role_id', roleId)

    if (applicantCount && applicantCount > 0) {
      throw new Error(`Cannot delete role with ${applicantCount} applicant(s). Please withdraw or reject all applications first.`)
    }

    // Delete the role
    const { error } = await supabase
      .from('job_roles')
      .delete()
      .eq('id', roleId)

    if (error) throw error

    // Update job total_budget
    const newTotalBudget = (role.job.total_budget || 0) - role.budget
    await supabase
      .from('job_postings')
      .update({ total_budget: Math.max(0, newTotalBudget) })
      .eq('id', role.job_id)

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting job role:', error)
    return {
      success: false,
      error: error.message || 'Failed to delete job role'
    }
  }
}

// Export all functions
export default {
  createJobPosting,
  getJobPostings,
  getJobPostingById,
  getMyJobs,
  getAppliedJobs,
  updateJobPosting,
  cancelJobPosting,
  applyToJobRole,
  getApplicationsForJob,
  getMyApplications,
  getMyAcceptedJobs,
  withdrawApplication,
  selectApplicant,
  rejectApplicant,
  checkAllRolesFilled,
  // Phase 5B: Workspace Features
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
  getWorkspaceStats,
  // Phase 5C: Job Editing
  addRoleToJob,
  updateJobRole,
  deleteJobRole
}
