/**
 * TEST DATA POPULATION SCRIPT
 *
 * Creates realistic test data for all platform features:
 * - Bookings between test users
 * - Messages/conversations
 * - Job postings and applications
 * - Calendar blocks
 * - Availability requests
 *
 * Run with: SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/populate-test-data.cjs
 */

const { createClient } = require('@supabase/supabase-js')

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://faqiwcrnltuqvhkmzrxp.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  console.log('Get it from: Supabase Dashboard > Settings > API > service_role key')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper to get random item from array
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]

// Helper to get random date in range
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Helper to add days to date
const addDays = (date, days) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// =====================================================
// MAIN DATA POPULATION FUNCTIONS
// =====================================================

async function getTestUsers() {
  console.log('📋 Fetching test users...')

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .not('display_name', 'is', null)

  if (error) throw error

  // Categorize users by role
  const users = {
    freelancers: profiles.filter(p => p.role === 'Artist' && !p.is_agent),
    vendors: profiles.filter(p => p.role === 'Vendor'),
    venues: profiles.filter(p => p.role === 'Venue'),
    agents: profiles.filter(p => p.is_agent === true),
    organisers: profiles.filter(p => p.role === 'Organiser'),
    all: profiles
  }

  console.log(`  Found: ${users.freelancers.length} freelancers, ${users.vendors.length} vendors, ${users.venues.length} venues, ${users.agents.length} agents, ${users.organisers.length} organisers`)

  return users
}

async function createBookings(users) {
  console.log('\n📅 Creating bookings...')

  const bookings = []
  const now = new Date()

  // Create 20 bookings with various statuses
  const statuses = ['pending', 'accepted', 'in_progress', 'completed', 'declined', 'cancelled']

  // Get all freelancers (artists that aren't agents)
  const freelancers = users.freelancers
  const clients = [...users.organisers, ...users.venues]

  if (freelancers.length === 0 || clients.length === 0) {
    console.log('  ⚠️ Not enough users to create bookings')
    return
  }

  for (let i = 0; i < 20; i++) {
    const freelancer = randomItem(freelancers)
    const client = randomItem(clients)

    // Skip if same user
    if (freelancer.id === client.id) continue

    const status = randomItem(statuses)
    const startDate = addDays(now, Math.floor(Math.random() * 60) - 30) // -30 to +30 days
    const duration = Math.floor(Math.random() * 3) + 1 // 1-3 days
    const endDate = addDays(startDate, duration)
    const rate = freelancer.daily_rate || freelancer.hourly_rate * 8 || 500

    const bookingData = {
      client_id: client.id,
      freelancer_id: freelancer.id,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      status: status,
      total_amount: rate * duration,
      service_description: `${freelancer.specialty || 'Entertainment'} services for ${duration} day(s)`,
      client_message: `Hi ${freelancer.display_name}, I'd like to book you for an event.`,
      freelancer_response: status !== 'pending' ? `Thank you for the booking request!` : null,
      cancellation_reason: status === 'cancelled' ? 'Schedule conflict' : null,
      created_at: addDays(startDate, -7).toISOString(),
      accepted_at: ['accepted', 'in_progress', 'completed'].includes(status) ? addDays(startDate, -5).toISOString() : null,
      completed_at: status === 'completed' ? endDate.toISOString() : null,
      cancelled_at: status === 'cancelled' ? addDays(startDate, -3).toISOString() : null
    }

    bookings.push(bookingData)
  }

  // Insert bookings
  const { data, error } = await supabase
    .from('bookings')
    .insert(bookings)
    .select()

  if (error) {
    console.log(`  ⚠️ Error creating bookings: ${error.message}`)
    // Try inserting one by one to see which ones fail
    let successCount = 0
    for (const booking of bookings) {
      const { error: singleError } = await supabase
        .from('bookings')
        .insert(booking)
      if (!singleError) successCount++
    }
    console.log(`  ✅ Created ${successCount} bookings (some may have failed due to constraints)`)
  } else {
    console.log(`  ✅ Created ${data?.length || bookings.length} bookings`)
  }
}

async function createMessages(users) {
  console.log('\n💬 Creating messages/conversations...')

  const messages = []
  const allUsers = users.all

  // Create 30 conversations (pairs of users messaging each other)
  for (let i = 0; i < 30; i++) {
    const user1 = randomItem(allUsers)
    let user2 = randomItem(allUsers)

    // Ensure different users
    while (user2.id === user1.id) {
      user2 = randomItem(allUsers)
    }

    // Create 3-8 messages per conversation
    const messageCount = Math.floor(Math.random() * 6) + 3
    const baseTime = randomDate(addDays(new Date(), -30), new Date())

    for (let j = 0; j < messageCount; j++) {
      const fromUser = j % 2 === 0 ? user1 : user2
      const toUser = j % 2 === 0 ? user2 : user1

      const messageTemplates = [
        `Hi! I saw your profile and I'm interested in working together.`,
        `Thanks for reaching out! What did you have in mind?`,
        `I'm planning an event and think you'd be perfect for it.`,
        `Sounds great! When is the event?`,
        `It's in ${Math.floor(Math.random() * 8) + 1} weeks. Are you available?`,
        `Let me check my calendar and get back to you.`,
        `Perfect, looking forward to hearing from you!`,
        `I'm available! Would love to discuss the details.`
      ]

      messages.push({
        from_id: fromUser.id,
        to_id: toUser.id,
        body: messageTemplates[j % messageTemplates.length],
        read: j < messageCount - 2, // Last 2 messages unread
        created_at: addDays(baseTime, j * 0.1).toISOString()
      })
    }
  }

  // Insert messages in batches
  const batchSize = 50
  let totalInserted = 0

  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize)
    const { error } = await supabase
      .from('messages')
      .insert(batch)

    if (!error) {
      totalInserted += batch.length
    }
  }

  console.log(`  ✅ Created ${totalInserted} messages`)
}

async function createJobPostings(users) {
  console.log('\n💼 Creating job postings...')

  const organisers = [...users.organisers, ...users.venues]

  if (organisers.length === 0) {
    console.log('  ⚠️ No organisers found to create jobs')
    return
  }

  const jobTemplates = [
    {
      title: 'Wedding DJ Needed',
      description: 'Looking for an experienced DJ for our wedding reception. Must have own equipment and be able to read the crowd.',
      event_type: 'wedding',
      roles: [
        { role_type: 'dj', title: 'Wedding DJ', budget_min: 800, budget_max: 1200, slots: 1 }
      ]
    },
    {
      title: 'Corporate Event Entertainment',
      description: 'Annual company party needs entertainment. Looking for a band and photographer.',
      event_type: 'corporate',
      roles: [
        { role_type: 'musician', title: 'Live Band', budget_min: 2000, budget_max: 3500, slots: 1 },
        { role_type: 'photographer', title: 'Event Photographer', budget_min: 500, budget_max: 800, slots: 1 }
      ]
    },
    {
      title: 'Birthday Party Photographer',
      description: 'Celebrating a milestone birthday! Need a photographer to capture the memories.',
      event_type: 'party',
      roles: [
        { role_type: 'photographer', title: 'Party Photographer', budget_min: 300, budget_max: 500, slots: 1 }
      ]
    },
    {
      title: 'Festival Staff Needed',
      description: 'Summer music festival looking for multiple crew members.',
      event_type: 'festival',
      roles: [
        { role_type: 'dj', title: 'Stage DJ', budget_min: 500, budget_max: 1000, slots: 3 },
        { role_type: 'videographer', title: 'Video Crew', budget_min: 600, budget_max: 900, slots: 2 },
        { role_type: 'photographer', title: 'Festival Photographer', budget_min: 400, budget_max: 600, slots: 2 }
      ]
    },
    {
      title: 'Charity Gala Entertainment',
      description: 'Annual charity gala needs sophisticated entertainment.',
      event_type: 'corporate',
      roles: [
        { role_type: 'musician', title: 'Jazz Quartet', budget_min: 1500, budget_max: 2500, slots: 1 },
        { role_type: 'mc', title: 'Event MC', budget_min: 500, budget_max: 800, slots: 1 }
      ]
    }
  ]

  const statuses = ['open', 'open', 'open', 'in_progress', 'filled', 'cancelled']
  let jobsCreated = 0
  let rolesCreated = 0

  for (const template of jobTemplates) {
    const organiser = randomItem(organisers)
    const status = randomItem(statuses)
    const eventDate = addDays(new Date(), Math.floor(Math.random() * 90) + 7)

    // Create job posting
    const { data: job, error: jobError } = await supabase
      .from('job_postings')
      .insert({
        organiser_id: organiser.id,
        title: template.title,
        description: template.description,
        event_type: template.event_type,
        start_date: eventDate.toISOString(),
        end_date: addDays(eventDate, 1).toISOString(),
        location: organiser.city || 'Sydney, NSW',
        status: status,
        total_budget: template.roles.reduce((sum, r) => sum + r.budget_max, 0)
      })
      .select()
      .single()

    if (jobError) {
      console.log(`  ⚠️ Error creating job: ${jobError.message}`)
      continue
    }

    jobsCreated++

    // Create roles for this job
    for (const role of template.roles) {
      const { error: roleError } = await supabase
        .from('job_roles')
        .insert({
          job_id: job.id,
          role_type: role.role_type,
          role_title: role.title,
          role_description: `${role.title} for ${template.title}`,
          budget: role.budget_max,
          quantity: role.slots,
          filled_count: 0
        })

      if (!roleError) rolesCreated++
    }
  }

  console.log(`  ✅ Created ${jobsCreated} job postings with ${rolesCreated} roles`)
}

async function createJobApplications(users) {
  console.log('\n📝 Creating job applications...')

  // Get existing jobs and roles
  const { data: jobs, error: jobsError } = await supabase
    .from('job_postings')
    .select(`
      *,
      job_roles(*)
    `)
    .eq('status', 'open')

  if (jobsError || !jobs?.length) {
    console.log('  ⚠️ No open jobs found')
    return
  }

  const freelancers = users.freelancers
  let applicationsCreated = 0

  for (const job of jobs) {
    for (const role of job.job_roles || []) {
      // Each role gets 2-4 applications
      const appCount = Math.floor(Math.random() * 3) + 2

      // Get matching freelancers (those with matching specialty)
      const matchingFreelancers = freelancers.filter(f =>
        f.specialty === role.role_type || Math.random() > 0.5
      )

      for (let i = 0; i < Math.min(appCount, matchingFreelancers.length); i++) {
        const applicant = matchingFreelancers[i]

        const { error } = await supabase
          .from('job_applications')
          .insert({
            job_id: job.id,
            role_id: role.id,
            applicant_id: applicant.id,
            proposed_rate: role.budget_min + Math.floor(Math.random() * (role.budget_max - role.budget_min)),
            cover_letter: `Hi! I'm ${applicant.display_name}, and I'd love to be your ${role.title}. I have extensive experience and would bring great energy to your event.`,
            status: 'pending'
          })

        if (!error) applicationsCreated++
      }
    }
  }

  console.log(`  ✅ Created ${applicationsCreated} job applications`)
}

async function createCalendarBlocks(users) {
  console.log('\n📆 Creating calendar blocks...')

  const freelancers = users.freelancers
  let blocksCreated = 0

  for (const freelancer of freelancers) {
    // Each freelancer gets 2-5 blocked periods
    const blockCount = Math.floor(Math.random() * 4) + 2

    for (let i = 0; i < blockCount; i++) {
      const startDate = addDays(new Date(), Math.floor(Math.random() * 60))
      const duration = Math.floor(Math.random() * 3) + 1

      const reasons = ['manual', 'unavailable', 'booking']
      const notes = [
        'Personal time',
        'Holiday',
        'Another gig',
        'Family event',
        'Travel'
      ]

      const { error } = await supabase
        .from('calendar_blocks')
        .insert({
          user_id: freelancer.id,
          start_date: startDate.toISOString(),
          end_date: addDays(startDate, duration).toISOString(),
          reason: randomItem(reasons),
          notes: randomItem(notes)
        })

      if (!error) blocksCreated++
    }
  }

  console.log(`  ✅ Created ${blocksCreated} calendar blocks`)
}

async function createAvailabilityRequests(users) {
  console.log('\n🔍 Creating availability requests...')

  const freelancers = users.freelancers
  const requesters = [...users.organisers, ...users.venues]

  if (freelancers.length === 0 || requesters.length === 0) {
    console.log('  ⚠️ Not enough users for availability requests')
    return
  }

  let requestsCreated = 0

  // Create 15 availability requests
  for (let i = 0; i < 15; i++) {
    const freelancer = randomItem(freelancers)
    const requester = randomItem(requesters)

    if (freelancer.id === requester.id) continue

    const requestDate = addDays(new Date(), Math.floor(Math.random() * 30) + 7)
    const statuses = ['pending', 'available', 'unavailable', 'expired']
    const status = randomItem(statuses)

    const { error } = await supabase
      .from('availability_requests')
      .insert({
        requester_id: requester.id,
        freelancer_id: freelancer.id,
        requested_date: requestDate.toISOString().split('T')[0],
        message: `Hi! Are you available on ${requestDate.toLocaleDateString()} for an event?`,
        status: status,
        response_message: status !== 'pending' ? `Thanks for checking! I'm ${status === 'available' ? 'available' : 'not available'} that day.` : null,
        responded_at: status !== 'pending' ? new Date().toISOString() : null
      })

    if (!error) requestsCreated++
  }

  console.log(`  ✅ Created ${requestsCreated} availability requests`)
}

async function createFavorites(users) {
  console.log('\n⭐ Creating favorites...')

  const allUsers = users.all
  let favoritesCreated = 0

  // Each user favorites 3-8 other users
  for (const user of allUsers) {
    const favoriteCount = Math.floor(Math.random() * 6) + 3
    const potentialFavorites = allUsers.filter(u => u.id !== user.id)

    for (let i = 0; i < Math.min(favoriteCount, potentialFavorites.length); i++) {
      const favoriteUser = potentialFavorites[i]

      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          profile_id: favoriteUser.id
        })

      if (!error) favoritesCreated++
    }
  }

  console.log(`  ✅ Created ${favoritesCreated} favorites`)
}

// =====================================================
// MAIN EXECUTION
// =====================================================

async function main() {
  console.log('🚀 Starting test data population...\n')
  console.log('=' .repeat(50))

  try {
    // Get existing test users
    const users = await getTestUsers()

    if (users.all.length === 0) {
      console.log('\n❌ No test users found! Run seed-test-users.cjs first.')
      process.exit(1)
    }

    // Create all test data
    await createBookings(users)
    await createMessages(users)
    await createJobPostings(users)
    await createJobApplications(users)
    await createCalendarBlocks(users)
    await createAvailabilityRequests(users)
    await createFavorites(users)

    console.log('\n' + '=' .repeat(50))
    console.log('✨ Test data population complete!')
    console.log('\nYou can now:')
    console.log('  1. Go to /test-accounts to log in as any test user')
    console.log('  2. Explore the dashboard, bookings, messages, and jobs')
    console.log('  3. Test the full booking and messaging workflows')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

main()
