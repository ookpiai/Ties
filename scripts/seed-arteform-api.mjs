/**
 * ARTEFORM STUDIOS PROFILE SEED (API Version)
 * Uses Supabase JS client with authentication
 *
 * Run with: node scripts/seed-arteform-api.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://faqiwcrnltuqvhkmzrxp.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhcWl3Y3JubHR1cXZoa216cnhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNDA4MzYsImV4cCI6MjA3NzcxNjgzNn0.UN7lOdny-7O2nxmGHvWdsuHkSB6xisse9a5ol1NjeXs'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Arteform profile data (matching actual schema)
const ARTEFORM_PROFILE = {
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
  website: 'https://arteform.com.au/',
  hourly_rate: 150,
  daily_rate: 900,
  social_links: {
    instagram: 'arteform_',
    tiktok: 'arteformstudios'
  },
  languages: [{ language: 'English', level: 'Native' }],
  is_verified: true,
  is_available: true
}

// Portfolio items
const PORTFOLIO_ITEMS = [
  {
    type: 'image',
    title: 'Brutalist Studio Interior',
    description: 'Our signature raw concrete and natural light aesthetic. The main studio space features floor-to-ceiling windows and industrial finishes.',
    skills_used: ['Studio Design', 'Interior Photography', 'Natural Lighting'],
    is_featured: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    media_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600',
    display_order: 0,
    view_count: 347
  },
  {
    type: 'image',
    title: 'Fashion Shoot Setup',
    description: 'Professional lighting configuration for fashion photography. Our studio includes Godox and Aputure lighting systems.',
    skills_used: ['Fashion Photography', 'Studio Lighting', 'Set Design'],
    is_featured: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800',
    media_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1600',
    display_order: 1,
    view_count: 289
  },
  {
    type: 'image',
    title: 'Brand Activation Event',
    description: 'Recent product launch event. The space transforms beautifully for intimate brand experiences with up to 80 guests.',
    skills_used: ['Event Hosting', 'Brand Activations', 'Product Launches'],
    is_featured: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    media_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600',
    display_order: 2,
    view_count: 198
  },
  {
    type: 'image',
    title: 'Content Creation Corner',
    description: 'Dedicated podcast and content creation setup with professional acoustic treatment and lighting.',
    skills_used: ['Podcast Recording', 'Content Creation', 'Audio Setup'],
    is_featured: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
    media_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1600',
    display_order: 3,
    view_count: 156
  },
  {
    type: 'image',
    title: 'Intimate Wedding Setup',
    description: 'Our space configured for an intimate wedding ceremony. Perfect for couples seeking a unique, modern venue.',
    skills_used: ['Wedding Venue', 'Event Styling', 'Intimate Ceremonies'],
    is_featured: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    media_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600',
    display_order: 4,
    view_count: 423
  },
  {
    type: 'video',
    title: 'ARTÈFORM Studio Tour',
    description: 'Take a virtual tour of our brutalist-inspired creative space.',
    skills_used: ['Videography', 'Studio Tour', 'Space Design'],
    is_featured: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
    external_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    external_platform: 'youtube',
    display_order: 5,
    view_count: 512
  },
  {
    type: 'video',
    title: 'Behind the Scenes - Fashion Shoot',
    description: 'Watch how our space comes alive during a professional fashion photography session.',
    skills_used: ['Fashion Photography', 'Behind the Scenes', 'Studio Work'],
    is_featured: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    external_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    external_platform: 'youtube',
    display_order: 6,
    view_count: 234
  },
  {
    type: 'link',
    title: 'ARTÈFORM Website',
    description: 'Visit our official website to view our full gallery, pricing, and booking calendar.',
    skills_used: ['Web Presence', 'Brand Identity'],
    is_featured: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    external_url: 'https://arteform.com.au/',
    display_order: 7,
    view_count: 678
  },
  {
    type: 'link',
    title: 'Instagram Portfolio',
    description: 'Follow @arteform_ for the latest shoots, events, and studio inspiration.',
    skills_used: ['Social Media', 'Visual Portfolio'],
    is_featured: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800',
    external_url: 'https://instagram.com/arteform_',
    display_order: 8,
    view_count: 445
  }
]

// Service data (to create service + packages)
const ARTEFORM_SERVICE = {
  title: 'Studio & Event Space Hire',
  description: 'Brutalist-inspired studio and event space for photography, content creation, brand activations, and intimate events.',
  category: 'Venue',
  subcategory: 'Studio',
  starting_price: 350,
  is_active: true,
  is_featured: true
}

// Service packages (matching actual schema with tier and service_id)
const SERVICE_PACKAGES = [
  {
    tier: 'basic',
    name: 'Podcast/Content Package',
    description: 'Specialized setup for podcast recording or content creation with acoustic treatment and professional audio.',
    price: 350,
    delivery_time_days: 1,
    features: ['Acoustic-treated space', 'Professional microphone setup', 'Ring lights and key lighting', 'Backdrop options', 'USB-C charging stations', 'Quiet recording environment'],
    is_popular: false
  },
  {
    tier: 'standard',
    name: 'Half Day Studio Hire',
    description: 'Perfect for quick shoots and content creation. Includes professional lighting setup and Bluetooth audio.',
    price: 450,
    delivery_time_days: 1,
    features: ['Professional studio lighting included', 'Bluetooth-connected JBL speaker', 'WiFi access', 'Street parking available', 'Pet-friendly', 'Walkthrough for lighting setup'],
    is_popular: true
  },
  {
    tier: 'premium',
    name: 'Full Day + Event Package',
    description: 'Full access to the studio for a day. Transform our space for your brand launch, private event, or intimate wedding.',
    price: 1500,
    delivery_time_days: 1,
    features: ['Full venue access all day', 'Capacity up to 80 guests', 'Event lighting options', 'Sound system setup', 'Early setup time included', 'Event coordinator support'],
    is_popular: false
  }
]

async function main() {
  console.log('═══════════════════════════════════════════════════════')
  console.log('  ARTÈFORM STUDIOS - Demo Profile Seed Script')
  console.log('  "A studio and event space for visionaries"')
  console.log('═══════════════════════════════════════════════════════')
  console.log('')

  // Step 1: Sign in as the Arteform user (created in previous run)
  console.log('🔐 Signing in as Arteform user...')
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'admin@arteform.com.au',
    password: 'TestPassword123!'
  })

  if (signInError) {
    console.error('  ❌ Sign in failed:', signInError.message)
    process.exit(1)
  }

  const userId = signInData.user.id
  console.log(`  ✅ Signed in as: ${userId}`)

  // Step 2: Update profile
  console.log('\n📝 Updating profile...')
  const { error: profileError } = await supabase
    .from('profiles')
    .update(ARTEFORM_PROFILE)
    .eq('id', userId)

  if (profileError) {
    console.log(`  ⚠️ Profile update error: ${profileError.message}`)
  } else {
    console.log('  ✅ Profile updated')
  }

  // Step 3: Clear and insert portfolio items
  console.log('\n🖼️ Creating portfolio items...')
  const { error: deletePortfolioError } = await supabase
    .from('portfolio_items')
    .delete()
    .eq('user_id', userId)

  if (deletePortfolioError) {
    console.log(`  ⚠️ Delete portfolio error: ${deletePortfolioError.message}`)
  }

  const portfolioWithUser = PORTFOLIO_ITEMS.map(item => ({ ...item, user_id: userId }))
  const { data: portfolioData, error: portfolioError } = await supabase
    .from('portfolio_items')
    .insert(portfolioWithUser)
    .select()

  if (portfolioError) {
    console.log(`  ⚠️ Portfolio error: ${portfolioError.message}`)
  } else {
    console.log(`  ✅ Created ${portfolioData?.length || 0} portfolio items`)
  }

  // Step 4: Create service first, then packages
  console.log('\n📦 Creating service and packages...')

  // Delete existing services for this user
  await supabase.from('services').delete().eq('owner_id', userId)

  // Create the service
  const { data: serviceData, error: serviceError } = await supabase
    .from('services')
    .insert({ ...ARTEFORM_SERVICE, owner_id: userId })
    .select()
    .single()

  if (serviceError) {
    console.log(`  ⚠️ Service error: ${serviceError.message}`)
  } else {
    console.log(`  ✅ Created service: ${serviceData.title}`)

    // Now create packages with the service_id
    const packagesWithService = SERVICE_PACKAGES.map(pkg => ({
      ...pkg,
      service_id: serviceData.id
    }))

    const { data: packagesData, error: packagesError } = await supabase
      .from('service_packages')
      .insert(packagesWithService)
      .select()

    if (packagesError) {
      console.log(`  ⚠️ Packages error: ${packagesError.message}`)
    } else {
      console.log(`  ✅ Created ${packagesData?.length || 0} service packages`)
    }
  }

  // Step 5: Insert or update profile stats (using correct column names)
  console.log('\n📊 Creating profile stats...')
  const statsData = {
    user_id: userId,
    total_bookings_completed: 47,
    total_reviews: 23,
    average_rating: 4.9,
    response_rate: 98,
    average_response_time_hours: 2,
    repeat_client_rate: 65,
    profile_views_total: 1250,
    profile_views_30d: 180,
    last_active_at: new Date().toISOString()
  }

  const { error: statsError } = await supabase
    .from('profile_stats')
    .upsert(statsData, { onConflict: 'user_id' })

  if (statsError) {
    console.log(`  ⚠️ Stats error: ${statsError.message}`)
  } else {
    console.log('  ✅ Profile stats created')
  }

  // Step 6: Add user badges
  console.log('\n🏆 Assigning badges...')
  const badges = [
    { user_id: userId, badge_type: 'identity_verified', awarded_reason: 'Verified venue owner' },
    { user_id: userId, badge_type: 'email_verified', awarded_reason: 'Email verified' },
    { user_id: userId, badge_type: 'top_rated', awarded_reason: '47 completed bookings, 4.9 rating' },
    { user_id: userId, badge_type: 'fast_responder', awarded_reason: 'Responds within 2 hours' }
  ]

  // Delete existing badges
  await supabase.from('user_badges').delete().eq('user_id', userId)

  const { data: badgesData, error: badgesError } = await supabase
    .from('user_badges')
    .insert(badges)
    .select()

  if (badgesError) {
    console.log(`  ⚠️ Badges error: ${badgesError.message}`)
  } else {
    console.log(`  ✅ Assigned ${badgesData?.length || 0} badges`)
  }

  // Sign out
  await supabase.auth.signOut()

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
}

main().catch(console.error)
