// TIES Together - Jobs API Layer
// Phase 5: Multi-Role Job Posting System

import { supabase } from '../lib/supabase'

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
    const bookingResult = await createBooking({
      freelancer_id: application.applicant_id,
      start_date: application.job.start_date,
      end_date: application.job.end_date,
      total_amount: application.proposed_rate || application.role.budget,
      service_description: `${application.role.role_title} for ${application.job.title}`,
      client_message: `Selected from job posting: ${application.job.title}`
    })

    if (!bookingResult.success || !bookingResult.data) {
      throw new Error('Failed to create booking: ' + bookingResult.error)
    }

    const booking = bookingResult.data

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

// Export all functions
export default {
  createJobPosting,
  getJobPostings,
  getJobPostingById,
  updateJobPosting,
  cancelJobPosting,
  applyToJobRole,
  getApplicationsForJob,
  getMyApplications,
  withdrawApplication,
  selectApplicant,
  checkAllRolesFilled
}
