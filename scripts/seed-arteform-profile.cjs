/**
 * ARTEFORM STUDIOS PROFILE SEED SCRIPT
 *
 * Populates a complete, demo-ready profile for Arteform Studios
 * A brutalist-inspired studio and event space on the Gold Coast
 *
 * Run with: SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/seed-arteform-profile.cjs
 *
 * Website: https://arteform.com.au/
 * Instagram: @arteform_
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

// Arteform Studios Profile Data
const ARTEFORM_PROFILE = {
  email: 'admin@arteform.com.au',
  display_name: 'ARTÈFORM Studios',
  username: 'arteformstudios',
  role: 'Venue',
  specialty: 'studio',
  headline: 'Brutalist-Inspired Studio & Event Space',
  tagline: 'Shoot. Launch. Curate.',
  bio: `ARTÈFORM is a brutalist-inspired studio and event space for visionaries, creatives and modern brands.

We blend raw aesthetics with refined design — a blank canvas for creators, lovers and brands to build something unforgettable.

Located in Miami, Gold Coast, our space offers professional studio lighting, premium audio equipment, and a curated atmosphere perfect for:

• Photography & Fashion Shoots
• Brand Launches & Activations
• Content Creation & Podcasts
• Private Events & Intimate Weddings
• Creative Workshops & Gatherings

Our space is pet-friendly with street parking available nearby. We believe in evolving with our community — every shoot, launch and event adds to the energy of ARTÈFORM.`,
  city: 'Gold Coast, QLD',
  country: 'Australia',
  website: 'https://arteform.com.au/',
  phone: null,
  hourly_rate: 150,
  daily_rate: 900,
  social_links: {
    instagram: 'arteform_',
    tiktok: 'arteformstudios',
    twitter: null,
    linkedin: null,
    youtube: null
  },
  languages: [
    { language: 'English', level: 'Native' }
  ],
  is_verified: true,
  is_available: true
}

// Portfolio Items for Arteform
const PORTFOLIO_ITEMS = [
  {
    type: 'image',
    title: 'Brutalist Studio Interior',
    description: 'Our signature raw concrete and natural light aesthetic. The main studio space features floor-to-ceiling windows and industrial finishes.',
    skills_used: ['Studio Design', 'Interior Photography', 'Natural Lighting'],
    is_featured: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    media_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600'
  },
  {
    type: 'image',
    title: 'Fashion Shoot Setup',
    description: 'Professional lighting configuration for fashion photography. Our studio includes Godox and Aputure lighting systems.',
    skills_used: ['Fashion Photography', 'Studio Lighting', 'Set Design'],
    is_featured: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800',
    media_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1600'
  },
  {
    type: 'image',
    title: 'Brand Activation Event',
    description: 'Recent product launch event. The space transforms beautifully for intimate brand experiences with up to 80 guests.',
    skills_used: ['Event Hosting', 'Brand Activations', 'Product Launches'],
    is_featured: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    media_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600'
  },
  {
    type: 'image',
    title: 'Content Creation Corner',
    description: 'Dedicated podcast and content creation setup with professional acoustic treatment and lighting.',
    skills_used: ['Podcast Recording', 'Content Creation', 'Audio Setup'],
    is_featured: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
    media_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1600'
  },
  {
    type: 'image',
    title: 'Intimate Wedding Setup',
    description: 'Our space configured for an intimate wedding ceremony. Perfect for couples seeking a unique, modern venue.',
    skills_used: ['Wedding Venue', 'Event Styling', 'Intimate Ceremonies'],
    is_featured: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    media_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600'
  },
  {
    type: 'video',
    title: 'ARTÈFORM Studio Tour',
    description: 'Take a virtual tour of our brutalist-inspired creative space. See how the natural light transforms throughout the day.',
    skills_used: ['Videography', 'Studio Tour', 'Space Design'],
    is_featured: false,
    external_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    external_platform: 'youtube',
    thumbnail_url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800'
  },
  {
    type: 'video',
    title: 'Behind the Scenes - Fashion Shoot',
    description: 'Watch how our space comes alive during a professional fashion photography session.',
    skills_used: ['Fashion Photography', 'Behind the Scenes', 'Studio Work'],
    is_featured: false,
    external_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    external_platform: 'youtube',
    thumbnail_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
  },
  {
    type: 'link',
    title: 'ARTÈFORM Website',
    description: 'Visit our official website to view our full gallery, pricing, and booking calendar.',
    skills_used: ['Web Presence', 'Brand Identity'],
    is_featured: false,
    external_url: 'https://arteform.com.au/',
    thumbnail_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
  },
  {
    type: 'link',
    title: 'Instagram Portfolio',
    description: 'Follow @arteform_ for the latest shoots, events, and studio inspiration.',
    skills_used: ['Social Media', 'Visual Portfolio'],
    is_featured: false,
    external_url: 'https://instagram.com/arteform_',
    thumbnail_url: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800'
  }
]

// Service Packages
const SERVICE_PACKAGES = [
  {
    name: 'Half Day Studio Hire',
    description: 'Perfect for quick shoots and content creation. Includes professional lighting setup and Bluetooth audio.',
    price: 450,
    duration_hours: 4,
    features: [
      'Professional studio lighting included',
      'Bluetooth-connected JBL speaker',
      'WiFi access',
      'Street parking available',
      'Pet-friendly',
      'Walkthrough for lighting setup'
    ],
    is_popular: false
  },
  {
    name: 'Full Day Studio Hire',
    description: 'Our most popular option. Full access to the studio for an entire day, perfect for larger shoots or events.',
    price: 900,
    duration_hours: 8,
    features: [
      'Everything in Half Day',
      'Early access setup available',
      'Multiple lighting configurations',
      'Flexible room layouts',
      'Equipment storage space',
      'Catering delivery accepted'
    ],
    is_popular: true
  },
  {
    name: 'Event Package',
    description: 'Transform our space for your brand launch, private event, or intimate wedding. Includes setup and breakdown time.',
    price: 1500,
    duration_hours: 12,
    features: [
      'Full venue access',
      'Capacity up to 80 guests',
      'Event lighting options',
      'Sound system setup',
      'Early setup time included',
      'Event coordinator support'
    ],
    is_popular: false
  },
  {
    name: 'Podcast/Content Package',
    description: 'Specialized setup for podcast recording or content creation with acoustic treatment and professional audio.',
    price: 350,
    duration_hours: 3,
    features: [
      'Acoustic-treated space',
      'Professional microphone setup',
      'Ring lights and key lighting',
      'Backdrop options',
      'USB-C charging stations',
      'Quiet recording environment'
    ],
    is_popular: false
  }
]

// Skills
const SKILLS = [
  { name: 'Studio Photography', category: 'creative', years_experience: 5, is_primary: true },
  { name: 'Event Hosting', category: 'events', years_experience: 5, is_primary: true },
  { name: 'Brand Activations', category: 'marketing', years_experience: 4, is_primary: true },
  { name: 'Wedding Venue', category: 'events', years_experience: 3, is_primary: false },
  { name: 'Content Creation Space', category: 'creative', years_experience: 4, is_primary: false },
  { name: 'Podcast Recording', category: 'audio', years_experience: 3, is_primary: false },
  { name: 'Fashion Photography', category: 'creative', years_experience: 4, is_primary: false },
  { name: 'Product Photography', category: 'creative', years_experience: 5, is_primary: false },
  { name: 'Video Production', category: 'creative', years_experience: 4, is_primary: false },
  { name: 'Workshop Hosting', category: 'events', years_experience: 3, is_primary: false }
]

// Badges to assign
const BADGE_CRITERIA = [
  'verified_identity',
  'profile_complete',
  'quick_responder',
  'top_rated'
]

// =====================================================
// MAIN SEED FUNCTIONS
// =====================================================

async function findOrCreateArteformUser() {
  console.log('🔍 Looking for Arteform user...')

  // First, check if user exists by email
  const { data: existingProfile, error: searchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', 'arteformstudios')
    .single()

  if (existingProfile) {
    console.log(`  ✅ Found existing profile: ${existingProfile.id}`)
    return existingProfile
  }

  // If not found, we need to create the auth user first
  console.log('  📝 Creating new Arteform user...')

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: ARTEFORM_PROFILE.email,
    password: 'TestPassword123!',
    email_confirm: true,
    user_metadata: {
      display_name: ARTEFORM_PROFILE.display_name,
      role: ARTEFORM_PROFILE.role
    }
  })

  if (authError) {
    // User might already exist in auth but not in profiles
    console.log(`  ⚠️ Auth user may already exist: ${authError.message}`)

    // Try to find by email in profiles with a different approach
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .ilike('display_name', '%ARTÈFORM%')
      .limit(1)

    if (profiles && profiles.length > 0) {
      console.log(`  ✅ Found profile by name: ${profiles[0].id}`)
      return profiles[0]
    }

    throw new Error('Could not find or create Arteform user')
  }

  console.log(`  ✅ Created auth user: ${authData.user.id}`)

  // Wait a moment for the trigger to create the profile
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Fetch the created profile
  const { data: newProfile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch created profile: ${profileError.message}`)
  }

  return newProfile
}

async function updateArteformProfile(userId) {
  console.log('\n📝 Updating Arteform profile...')

  const { data, error } = await supabase
    .from('profiles')
    .update({
      display_name: ARTEFORM_PROFILE.display_name,
      username: ARTEFORM_PROFILE.username,
      role: ARTEFORM_PROFILE.role,
      specialty: ARTEFORM_PROFILE.specialty,
      headline: ARTEFORM_PROFILE.headline,
      tagline: ARTEFORM_PROFILE.tagline,
      bio: ARTEFORM_PROFILE.bio,
      city: ARTEFORM_PROFILE.city,
      country: ARTEFORM_PROFILE.country,
      website: ARTEFORM_PROFILE.website,
      hourly_rate: ARTEFORM_PROFILE.hourly_rate,
      daily_rate: ARTEFORM_PROFILE.daily_rate,
      social_links: ARTEFORM_PROFILE.social_links,
      languages: ARTEFORM_PROFILE.languages,
      is_verified: ARTEFORM_PROFILE.is_verified,
      is_available: ARTEFORM_PROFILE.is_available,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.log(`  ⚠️ Error updating profile: ${error.message}`)
    return null
  }

  console.log(`  ✅ Profile updated successfully`)
  return data
}

async function createPortfolioItems(userId) {
  console.log('\n🖼️ Creating portfolio items...')

  // First, delete existing portfolio items for this user
  const { error: deleteError } = await supabase
    .from('portfolio_items')
    .delete()
    .eq('user_id', userId)

  if (deleteError) {
    console.log(`  ⚠️ Could not clear existing items: ${deleteError.message}`)
  }

  const portfolioData = PORTFOLIO_ITEMS.map((item, index) => ({
    user_id: userId,
    ...item,
    display_order: index,
    view_count: Math.floor(Math.random() * 500) + 50,
    created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
  }))

  const { data, error } = await supabase
    .from('portfolio_items')
    .insert(portfolioData)
    .select()

  if (error) {
    console.log(`  ⚠️ Error creating portfolio: ${error.message}`)
    return []
  }

  console.log(`  ✅ Created ${data.length} portfolio items`)
  return data
}

async function createServicePackages(userId) {
  console.log('\n📦 Creating service packages...')

  // Delete existing packages
  const { error: deleteError } = await supabase
    .from('service_packages')
    .delete()
    .eq('user_id', userId)

  if (deleteError) {
    console.log(`  ⚠️ Could not clear existing packages: ${deleteError.message}`)
  }

  const packagesData = SERVICE_PACKAGES.map((pkg, index) => ({
    user_id: userId,
    ...pkg,
    display_order: index,
    is_active: true,
    created_at: new Date().toISOString()
  }))

  const { data, error } = await supabase
    .from('service_packages')
    .insert(packagesData)
    .select()

  if (error) {
    console.log(`  ⚠️ Error creating packages: ${error.message}`)
    return []
  }

  console.log(`  ✅ Created ${data.length} service packages`)
  return data
}

async function createSkills(userId) {
  console.log('\n🎯 Creating skills...')

  // Delete existing skills
  const { error: deleteError } = await supabase
    .from('user_skills')
    .delete()
    .eq('user_id', userId)

  if (deleteError) {
    console.log(`  ⚠️ Could not clear existing skills: ${deleteError.message}`)
  }

  const skillsData = SKILLS.map(skill => ({
    user_id: userId,
    ...skill,
    endorsement_count: Math.floor(Math.random() * 20) + 5,
    created_at: new Date().toISOString()
  }))

  const { data, error } = await supabase
    .from('user_skills')
    .insert(skillsData)
    .select()

  if (error) {
    console.log(`  ⚠️ Error creating skills: ${error.message}`)
    return []
  }

  console.log(`  ✅ Created ${data.length} skills`)
  return data
}

async function assignBadges(userId) {
  console.log('\n🏆 Assigning badges...')

  // Get available badges
  const { data: badges, error: badgeError } = await supabase
    .from('badges')
    .select('*')
    .in('criteria', BADGE_CRITERIA)

  if (badgeError || !badges) {
    console.log(`  ⚠️ Could not fetch badges: ${badgeError?.message || 'No badges found'}`)
    return []
  }

  // Delete existing user badges
  const { error: deleteError } = await supabase
    .from('user_badges')
    .delete()
    .eq('user_id', userId)

  if (deleteError) {
    console.log(`  ⚠️ Could not clear existing badges: ${deleteError.message}`)
  }

  const userBadges = badges.map(badge => ({
    user_id: userId,
    badge_id: badge.id,
    earned_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
  }))

  const { data, error } = await supabase
    .from('user_badges')
    .insert(userBadges)
    .select()

  if (error) {
    console.log(`  ⚠️ Error assigning badges: ${error.message}`)
    return []
  }

  console.log(`  ✅ Assigned ${data.length} badges`)
  return data
}

async function createProfileStats(userId) {
  console.log('\n📊 Creating profile stats...')

  // Delete existing stats
  await supabase
    .from('profile_stats')
    .delete()
    .eq('user_id', userId)

  const statsData = {
    user_id: userId,
    total_projects: 47,
    total_reviews: 23,
    average_rating: 4.9,
    response_rate: 98,
    response_time_hours: 2,
    repeat_client_rate: 65,
    profile_views: 1250,
    profile_views_this_month: 180,
    last_active: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('profile_stats')
    .insert(statsData)
    .select()
    .single()

  if (error) {
    console.log(`  ⚠️ Error creating stats: ${error.message}`)
    return null
  }

  console.log(`  ✅ Profile stats created`)
  return data
}

// =====================================================
// MAIN EXECUTION
// =====================================================

async function main() {
  console.log('═══════════════════════════════════════════════════════')
  console.log('  ARTÈFORM STUDIOS - Demo Profile Seed Script')
  console.log('  "A studio and event space for visionaries"')
  console.log('═══════════════════════════════════════════════════════')
  console.log('')

  try {
    // Step 1: Find or create user
    const user = await findOrCreateArteformUser()
    const userId = user.id
    console.log(`\n🎯 Working with user ID: ${userId}`)

    // Step 2: Update profile
    await updateArteformProfile(userId)

    // Step 3: Create portfolio items
    await createPortfolioItems(userId)

    // Step 4: Create service packages
    await createServicePackages(userId)

    // Step 5: Create skills
    await createSkills(userId)

    // Step 6: Assign badges
    await assignBadges(userId)

    // Step 7: Create profile stats
    await createProfileStats(userId)

    console.log('\n═══════════════════════════════════════════════════════')
    console.log('  ✅ ARTÈFORM Studios profile is now demo-ready!')
    console.log('')
    console.log('  Login credentials:')
    console.log('  Email: admin@arteform.com.au')
    console.log('  Password: TestPassword123!')
    console.log('')
    console.log('  Instagram: @arteform_')
    console.log('  Website: https://arteform.com.au/')
    console.log('═══════════════════════════════════════════════════════')

  } catch (error) {
    console.error('\n❌ Seed failed:', error.message)
    process.exit(1)
  }
}

main()
