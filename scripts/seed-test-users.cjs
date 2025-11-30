/**
 * Test User Seeding Script for TIES Together
 *
 * Creates 50 test users across all user types for manual testing.
 * Run with: node scripts/seed-test-users.js
 *
 * All users have password: TestPassword123!
 */

const { createClient } = require('@supabase/supabase-js')

// Get these from your .env file
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://faqiwcrnltuqvhkmzrxp.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY // Need service role key for admin operations

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

// Common password for all test users
const TEST_PASSWORD = 'TestPassword123!'

// Australian cities for variety
const CITIES = [
  'Sydney, NSW', 'Melbourne, VIC', 'Brisbane, QLD', 'Perth, WA',
  'Adelaide, SA', 'Gold Coast, QLD', 'Newcastle, NSW', 'Canberra, ACT',
  'Hobart, TAS', 'Darwin, NT'
]

// Test user data - 50 users total with realistic Australian names
const TEST_USERS = [
  // ==================== FREELANCERS (20 users) ====================
  // DJs (5)
  { email: 'alex.thompson.dj@gmail.com', name: 'Alex Thompson', username: 'alexthompson', role: 'Artist', specialty: 'dj', city: 0, bio: 'Professional DJ with 10+ years experience in weddings, corporate events, and nightclubs.', hourly: 120, daily: 900 },
  { email: 'samuel.chen@outlook.com', name: 'Samuel Chen', username: 'samuelchen', role: 'Artist', specialty: 'dj', city: 1, bio: 'Electronic music specialist. House, techno, and progressive sets.', hourly: 150, daily: 1100 },
  { email: 'maya.rodriguez.music@gmail.com', name: 'Maya Rodriguez', username: 'mayarodriguez', role: 'Artist', specialty: 'dj', city: 2, bio: 'Festival DJ and radio presenter. High-energy sets that get the crowd moving.', hourly: 200, daily: 1500 },
  { email: 'chris.wilson.vinyl@gmail.com', name: 'Chris Wilson', username: 'chriswilson', role: 'Artist', specialty: 'dj', city: 3, bio: 'Old school vinyl DJ. Funk, soul, and disco specialist.', hourly: 100, daily: 750 },
  { email: 'nina.patel.beats@outlook.com', name: 'Nina Patel', username: 'ninapatel', role: 'Artist', specialty: 'dj', city: 4, bio: 'Club DJ and music producer. Deep house and melodic techno.', hourly: 180, daily: 1300 },

  // Photographers (5)
  { email: 'james.harrison.photo@gmail.com', name: 'James Harrison', username: 'jamesharrison', role: 'Artist', specialty: 'photographer', city: 0, bio: 'Award-winning wedding and portrait photographer with a documentary style.', hourly: 200, daily: 1800 },
  { email: 'emma.nguyen.photography@gmail.com', name: 'Emma Nguyen', username: 'emmanguyen', role: 'Artist', specialty: 'photographer', city: 1, bio: 'Fashion and editorial photographer. Studio and location shoots.', hourly: 250, daily: 2000 },
  { email: 'david.martinez.shots@outlook.com', name: 'David Martinez', username: 'davidmartinez', role: 'Artist', specialty: 'photographer', city: 2, bio: 'Corporate event and headshot specialist. Quick turnaround guaranteed.', hourly: 150, daily: 1200 },
  { email: 'lisa.taylor.captures@gmail.com', name: 'Lisa Taylor', username: 'lisataylor', role: 'Artist', specialty: 'photographer', city: 5, bio: 'Creative portrait and lifestyle photographer. Natural light specialist.', hourly: 180, daily: 1400 },
  { email: 'michael.brown.lens@gmail.com', name: 'Michael Brown', username: 'michaelbrown', role: 'Artist', specialty: 'photographer', city: 6, bio: 'Sports and action photographer. High-speed photography expert.', hourly: 220, daily: 1700 },

  // Musicians (5)
  { email: 'sarah.campbell.violin@gmail.com', name: 'Sarah Campbell', username: 'sarahcampbell', role: 'Artist', specialty: 'musician', city: 0, bio: 'Classical violinist available for weddings and corporate events.', hourly: 180, daily: 1400 },
  { email: 'tom.fitzgerald.keys@outlook.com', name: 'Tom Fitzgerald', username: 'tomfitzgerald', role: 'Artist', specialty: 'musician', city: 1, bio: 'Jazz pianist and vocalist. Solo or with trio available.', hourly: 200, daily: 1500 },
  { email: 'amy.lawrence.acoustic@gmail.com', name: 'Amy Lawrence', username: 'amylawrence', role: 'Artist', specialty: 'musician', city: 4, bio: 'Singer-songwriter with acoustic guitar. Perfect for intimate events.', hourly: 150, daily: 1100 },
  { email: 'thegroovecollective@gmail.com', name: 'The Groove Collective', username: 'groovecollective', role: 'Artist', specialty: 'musician', city: 2, bio: '5-piece cover band playing hits from the 60s to today.', hourly: 500, daily: 4000 },
  { email: 'sydneyjazzquartet@outlook.com', name: 'Sydney Jazz Quartet', username: 'sydneyjazz', role: 'Artist', specialty: 'musician', city: 3, bio: 'Professional jazz quartet for upscale events and functions.', hourly: 400, daily: 3000 },

  // Videographers (3)
  { email: 'ryan.anderson.films@gmail.com', name: 'Ryan Anderson', username: 'ryananderson', role: 'Artist', specialty: 'videographer', city: 0, bio: 'Cinematic wedding films and corporate videos. 4K drone footage available.', hourly: 200, daily: 1600 },
  { email: 'kate.morrison.video@gmail.com', name: 'Kate Morrison', username: 'katemorrison', role: 'Artist', specialty: 'videographer', city: 1, bio: 'Documentary-style videographer. Music videos and event coverage.', hourly: 180, daily: 1400 },
  { email: 'mark.stevens.production@outlook.com', name: 'Mark Stevens', username: 'markstevens', role: 'Artist', specialty: 'videographer', city: 5, bio: 'Full production team for large events. Live streaming available.', hourly: 350, daily: 2800 },

  // MCs/Hosts (2)
  { email: 'joseph.kelly.mc@gmail.com', name: 'Joseph Kelly', username: 'josephkelly', role: 'Artist', specialty: 'mc', city: 0, bio: 'Professional MC and event host. Weddings, corporate, and charity events.', hourly: 150, daily: 1000 },
  { email: 'grace.mitchell.presenter@outlook.com', name: 'Grace Mitchell', username: 'gracemitchell', role: 'Artist', specialty: 'mc', city: 1, bio: 'TV presenter and corporate MC. Keynote introductions and panel moderation.', hourly: 200, daily: 1500 },

  // ==================== VENDORS (10 users) ====================
  // Catering (3)
  { email: 'gourmeteventsco@gmail.com', name: 'Gourmet Events Catering', username: 'gourmetevents', role: 'Vendor', specialty: 'catering', city: 0, bio: 'Premium catering for weddings and corporate events. Farm-to-table menu options.', hourly: 0, daily: 5000 },
  { email: 'outbackbbqcatering@outlook.com', name: 'Outback BBQ Catering', username: 'outbackbbq', role: 'Vendor', specialty: 'catering', city: 2, bio: 'Australian BBQ specialists. Food trucks and on-site cooking.', hourly: 0, daily: 2500 },
  { email: 'sweettreatsmelb@gmail.com', name: 'Sweet Treats Melbourne', username: 'sweettreats', role: 'Vendor', specialty: 'catering', city: 1, bio: 'Custom cakes, dessert bars, and sweet catering for all occasions.', hourly: 0, daily: 1500 },

  // Equipment Rental (3)
  { email: 'prosoundrentals@gmail.com', name: 'Pro Sound Rentals', username: 'prosoundrentals', role: 'Vendor', specialty: 'av_equipment', city: 0, bio: 'PA systems, speakers, and audio equipment for events of all sizes.', hourly: 100, daily: 800 },
  { email: 'brilliantlighting@outlook.com', name: 'Brilliant Lighting Hire', username: 'brilliantlighting', role: 'Vendor', specialty: 'av_equipment', city: 1, bio: 'Stage lighting, LED walls, and special effects equipment.', hourly: 150, daily: 1200 },
  { email: 'eventstagehire@gmail.com', name: 'Event Stage Hire', username: 'eventstagehire', role: 'Vendor', specialty: 'av_equipment', city: 3, bio: 'Stages, marquees, furniture hire for events and festivals.', hourly: 0, daily: 3000 },

  // Event Services (4)
  { email: 'petalsandblooms@gmail.com', name: 'Petals & Blooms Florist', username: 'petalsandblooms', role: 'Vendor', specialty: 'florist', city: 0, bio: 'Wedding and event floristry. Custom arrangements and venue styling.', hourly: 0, daily: 2000 },
  { email: 'eleganteventstyling@outlook.com', name: 'Elegant Event Styling', username: 'elegantstyling', role: 'Vendor', specialty: 'decor', city: 1, bio: 'Event decorations, balloon arches, and themed styling.', hourly: 80, daily: 600 },
  { email: 'prestige.transport@gmail.com', name: 'Prestige Event Transport', username: 'prestigetransport', role: 'Vendor', specialty: 'transport', city: 0, bio: 'Wedding cars, limousines, and guest shuttle services.', hourly: 200, daily: 1500 },
  { email: 'shieldeventsecurity@gmail.com', name: 'Shield Event Security', username: 'shieldsecurity', role: 'Vendor', specialty: 'security', city: 2, bio: 'Licensed security guards for events, venues, and VIP protection.', hourly: 45, daily: 350 },

  // ==================== VENUES (10 users) ====================
  { email: 'grandballroom.syd@gmail.com', name: 'Grand Ballroom Sydney', username: 'grandballroomsyd', role: 'Venue', specialty: 'ballroom', city: 0, bio: 'Elegant ballroom venue seating up to 500 guests. Full catering available.', hourly: 500, daily: 8000 },
  { email: 'skyline.rooftop@outlook.com', name: 'Skyline Rooftop Venue', username: 'skylinerooftop', role: 'Venue', specialty: 'rooftop', city: 0, bio: 'Stunning rooftop venue with city views. Capacity 200.', hourly: 400, daily: 6000 },
  { email: 'gardenpavilion.melb@gmail.com', name: 'Garden Pavilion Melbourne', username: 'gardenpavilion', role: 'Venue', specialty: 'garden', city: 1, bio: 'Beautiful garden venue for weddings and events. Indoor/outdoor options.', hourly: 350, daily: 5500 },
  { email: 'industrialspace.melb@gmail.com', name: 'The Industrial Space', username: 'industrialspace', role: 'Venue', specialty: 'warehouse', city: 1, bio: 'Converted warehouse venue. Perfect for creative events and launches.', hourly: 300, daily: 4500 },
  { email: 'sunsetbeach.gc@outlook.com', name: 'Sunset Beach Club', username: 'sunsetbeachclub', role: 'Venue', specialty: 'beach', city: 5, bio: 'Beachfront venue with stunning ocean views. Capacity 300.', hourly: 450, daily: 7000 },
  { email: 'valleyview.winery@gmail.com', name: 'Valley View Winery', username: 'valleyviewwinery', role: 'Venue', specialty: 'winery', city: 4, bio: 'Picturesque winery venue in the Adelaide Hills. Wine tasting included.', hourly: 400, daily: 6500 },
  { email: 'heritage.house.cbr@gmail.com', name: 'Heritage House Canberra', username: 'heritagehouse', role: 'Venue', specialty: 'historic', city: 7, bio: 'Historic mansion venue in Canberra. Heritage-listed building.', hourly: 380, daily: 5800 },
  { email: 'crownconference@outlook.com', name: 'Crown Conference Centre', username: 'crownconference', role: 'Venue', specialty: 'hotel', city: 1, bio: 'Premium hotel venue with multiple conference rooms. Full AV included.', hourly: 600, daily: 10000 },
  { email: 'creativestudiosyd@gmail.com', name: 'Creative Studio Sydney', username: 'creativestudio', role: 'Venue', specialty: 'studio', city: 0, bio: 'Photography and video studio with cyclorama wall and lighting grid.', hourly: 150, daily: 1200 },
  { email: 'osteria.dining@gmail.com', name: 'Osteria Private Dining', username: 'osteriadining', role: 'Venue', specialty: 'restaurant', city: 1, bio: 'Italian restaurant with private dining room. Seating 40 guests.', hourly: 200, daily: 3000 },

  // ==================== AGENTS (5 users) ====================
  { email: 'rachel.hughes.talent@gmail.com', name: 'Rachel Hughes', username: 'rachelhughes', role: 'Artist', specialty: 'agent', city: 0, bio: 'Full-service talent management for DJs, musicians, and entertainers.', hourly: 0, daily: 0, isAgent: true, agentTags: ['DJ', 'Music', 'Entertainment'] },
  { email: 'daniel.wong.agency@outlook.com', name: 'Daniel Wong', username: 'danielwong', role: 'Artist', specialty: 'agent', city: 1, bio: 'Representing Australia\'s top event photographers and videographers.', hourly: 0, daily: 0, isAgent: true, agentTags: ['Photography', 'Videography', 'Events'] },
  { email: 'stephanie.clarke.mgmt@gmail.com', name: 'Stephanie Clarke', username: 'stephanieclarke', role: 'Artist', specialty: 'agent', city: 2, bio: 'Boutique agency for creative professionals. Personal management.', hourly: 0, daily: 0, isAgent: true, agentTags: ['Music', 'Entertainment', 'Corporate'] },
  { email: 'robert.james.talent@gmail.com', name: 'Robert James', username: 'robertjames', role: 'Artist', specialty: 'agent', city: 0, bio: 'High-end talent representation for luxury events and weddings.', hourly: 0, daily: 0, isAgent: true, agentTags: ['Weddings', 'Corporate', 'Music'] },
  { email: 'michelle.lee.artists@outlook.com', name: 'Michelle Lee', username: 'michellelee', role: 'Artist', specialty: 'agent', city: 3, bio: 'Specialized in live music acts, bands, and solo performers.', hourly: 0, daily: 0, isAgent: true, agentTags: ['Music', 'Live Performance', 'Bands'] },

  // ==================== ORGANISERS/CLIENTS (5 users) ====================
  { email: 'sarah.white.wedding@gmail.com', name: 'Sarah White', username: 'sarahwhite', role: 'Organiser', specialty: null, city: 0, bio: 'Planning our dream wedding for December 2025.', hourly: 0, daily: 0 },
  { email: 'corporate.events.techcorp@outlook.com', name: 'Jennifer Adams', username: 'jenniferadams', role: 'Organiser', specialty: null, city: 1, bio: 'Corporate event planning for TechCorp Australia.', hourly: 0, daily: 0 },
  { email: 'marcus.johnson.festival@gmail.com', name: 'Marcus Johnson', username: 'marcusjohnson', role: 'Organiser', specialty: null, city: 2, bio: 'Organizing the annual Summer Music Festival in Brisbane.', hourly: 0, daily: 0 },
  { email: 'charity.gala.committee@gmail.com', name: 'Patricia Reynolds', username: 'patriciareynolds', role: 'Organiser', specialty: null, city: 0, bio: 'Planning the annual Children\'s Hospital fundraising gala.', hourly: 0, daily: 0 },
  { email: 'emma.davis.party@outlook.com', name: 'Emma Davis', username: 'emmadavis', role: 'Organiser', specialty: null, city: 4, bio: 'Planning an epic 30th birthday celebration!', hourly: 0, daily: 0 },
]

// Avatar URLs (using UI Avatars service)
const getAvatarUrl = (name) => {
  const initials = name.split(' ').map(n => n[0]).join('')
  const colors = ['0D8ABC', '9B59B6', 'E74C3C', '27AE60', 'F39C12', '1ABC9C', 'E67E22', '3498DB']
  const color = colors[Math.floor(Math.random() * colors.length)]
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${color}&color=fff&size=200`
}

async function createTestUsers() {
  console.log('🚀 Starting test user creation...\n')

  const results = {
    success: [],
    failed: []
  }

  for (const userData of TEST_USERS) {
    try {
      console.log(`Creating user: ${userData.email}...`)

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: TEST_PASSWORD,
        email_confirm: true // Auto-confirm email
      })

      if (authError) {
        // User might already exist
        if (authError.message.includes('already been registered')) {
          console.log(`  ⚠️ User already exists, skipping auth creation`)
          // Try to get existing user
          const { data: existingUsers } = await supabase.auth.admin.listUsers()
          const existingUser = existingUsers?.users?.find(u => u.email === userData.email)
          if (existingUser) {
            // Update profile instead
            await updateProfile(existingUser.id, userData)
            results.success.push({ email: userData.email, id: existingUser.id })
            continue
          }
        }
        throw authError
      }

      const userId = authData.user.id

      // 2. Create/update profile
      await updateProfile(userId, userData)

      results.success.push({ email: userData.email, id: userId })
      console.log(`  ✅ Created: ${userData.name} (${userData.role})`)

    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`)
      results.failed.push({ email: userData.email, error: error.message })
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('\n📊 Summary:')
  console.log(`  ✅ Successful: ${results.success.length}`)
  console.log(`  ❌ Failed: ${results.failed.length}`)

  if (results.failed.length > 0) {
    console.log('\nFailed users:')
    results.failed.forEach(f => console.log(`  - ${f.email}: ${f.error}`))
  }

  return results
}

async function updateProfile(userId, userData) {
  const profileData = {
    id: userId,
    username: userData.username,
    display_name: userData.name,
    role: userData.role,
    specialty: userData.specialty,
    city: CITIES[userData.city],
    bio: userData.bio,
    avatar_url: getAvatarUrl(userData.name),
    hourly_rate: userData.hourly || null,
    daily_rate: userData.daily || null,
    onboarding_completed: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Agent-specific fields
  if (userData.isAgent) {
    profileData.is_agent = true
    profileData.is_agent_verified = true
    profileData.agent_verification_status = 'approved'
    profileData.agent_bio = userData.bio
    profileData.agent_website_url = `https://${userData.name.toLowerCase().replace(/\s+/g, '')}.com`
    profileData.agent_industry_tags = userData.agentTags || []
    profileData.agent_phone = '0400000000'
  }

  const { error } = await supabase
    .from('profiles')
    .upsert(profileData, { onConflict: 'id' })

  if (error) throw error
}

// Export for use in other scripts
module.exports = { TEST_USERS, TEST_PASSWORD, createTestUsers }

// Run if called directly
if (require.main === module) {
  createTestUsers()
    .then(() => {
      console.log('\n✨ Test user seeding complete!')
      process.exit(0)
    })
    .catch(error => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}
