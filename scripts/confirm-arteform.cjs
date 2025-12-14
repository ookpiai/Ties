/**
 * Confirm Arteform user email and update profile
 */
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://faqiwcrnltuqvhkmzrxp.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
  console.log('🔧 Confirming Arteform user and updating profile...\n')

  // 1. Find the user
  const { data: users, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) throw listError

  const arteformUser = users.users.find(u => u.email === 'admin@arteform.com.au')
  if (!arteformUser) {
    console.log('❌ Arteform user not found')
    process.exit(1)
  }

  console.log(`Found user: ${arteformUser.id}`)
  console.log(`Email confirmed: ${arteformUser.email_confirmed_at ? 'Yes' : 'No'}`)

  // 2. Confirm email if not confirmed
  if (!arteformUser.email_confirmed_at) {
    console.log('Confirming email...')
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      arteformUser.id,
      { email_confirm: true }
    )
    if (updateError) {
      console.log(`⚠️ Failed to confirm email: ${updateError.message}`)
    } else {
      console.log('✅ Email confirmed')
    }
  }

  // 3. Create/Update profile
  console.log('\nCreating/Updating profile...')
  const profileData = {
    id: arteformUser.id,
    username: 'arteformstudios',
    display_name: 'ARTÈFORM Studios',
    role: 'Venue',
    specialty: 'studio',
    city: 'Gold Coast, QLD',
    bio: `ARTÈFORM is a brutalist-inspired studio and event space for visionaries, creatives and modern brands.

We blend raw aesthetics with refined design — a blank canvas for creators, lovers and brands to build something unforgettable.

Located in Miami, Gold Coast, our space offers professional studio lighting, premium audio equipment, and a curated atmosphere perfect for:

• Photography & Fashion Shoots
• Brand Launches & Activations
• Content Creation & Podcasts
• Private Events & Intimate Weddings
• Creative Workshops & Gatherings

Our space is pet-friendly with street parking available nearby.`,
    headline: 'Brutalist-Inspired Studio & Event Space',
    tagline: 'Shoot. Launch. Curate.',
    website_url: 'https://arteform.com.au/',
    social_links: { instagram: 'arteform_', tiktok: 'arteformstudios' },
    hourly_rate: 150,
    daily_rate: 900,
    onboarding_completed: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // First try insert, if fails try update
  const { error: insertError } = await supabase
    .from('profiles')
    .insert(profileData)

  if (insertError) {
    if (insertError.code === '23505') { // Duplicate key
      console.log('Profile exists, updating...')
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: profileData.username,
          display_name: profileData.display_name,
          role: profileData.role,
          specialty: profileData.specialty,
          city: profileData.city,
          bio: profileData.bio,
          headline: profileData.headline,
          tagline: profileData.tagline,
          website_url: profileData.website_url,
          social_links: profileData.social_links,
          hourly_rate: profileData.hourly_rate,
          daily_rate: profileData.daily_rate,
          onboarding_completed: profileData.onboarding_completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', arteformUser.id)

      if (updateError) {
        console.log(`⚠️ Profile update error: ${updateError.message}`)
      } else {
        console.log('✅ Profile updated')
      }
    } else {
      console.log(`⚠️ Profile insert error: ${insertError.message}`)
    }
  } else {
    console.log('✅ Profile created')
  }

  // 4. Add portfolio items
  console.log('\nAdding portfolio items...')
  await supabase.from('portfolio_items').delete().eq('user_id', arteformUser.id)

  const portfolioItems = [
    { user_id: arteformUser.id, type: 'image', title: 'Brutalist Studio Interior', description: 'Our signature raw concrete and natural light aesthetic.', skills_used: ['Studio Design', 'Natural Lighting'], is_featured: true, thumbnail_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', media_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600', display_order: 0, view_count: 347 },
    { user_id: arteformUser.id, type: 'image', title: 'Fashion Shoot Setup', description: 'Professional lighting for fashion photography.', skills_used: ['Fashion Photography', 'Studio Lighting'], is_featured: true, thumbnail_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800', media_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1600', display_order: 1, view_count: 289 },
    { user_id: arteformUser.id, type: 'image', title: 'Brand Activation Event', description: 'Recent product launch event for up to 80 guests.', skills_used: ['Event Hosting', 'Brand Activations'], is_featured: false, thumbnail_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', media_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600', display_order: 2, view_count: 198 },
    { user_id: arteformUser.id, type: 'image', title: 'Content Creation Corner', description: 'Podcast and content creation setup.', skills_used: ['Podcast Recording', 'Content Creation'], is_featured: false, thumbnail_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800', media_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1600', display_order: 3, view_count: 156 },
    { user_id: arteformUser.id, type: 'image', title: 'Intimate Wedding Setup', description: 'Perfect for couples seeking a unique venue.', skills_used: ['Wedding Venue', 'Event Styling'], is_featured: true, thumbnail_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', media_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600', display_order: 4, view_count: 423 },
    { user_id: arteformUser.id, type: 'video', title: 'ARTÈFORM Studio Tour', description: 'Virtual tour of our creative space.', skills_used: ['Videography'], is_featured: false, thumbnail_url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800', external_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', external_platform: 'youtube', display_order: 5, view_count: 512 },
    { user_id: arteformUser.id, type: 'link', title: 'ARTÈFORM Website', description: 'Our official website.', skills_used: ['Web Presence'], is_featured: false, thumbnail_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', external_url: 'https://arteform.com.au/', display_order: 6, view_count: 678 },
    { user_id: arteformUser.id, type: 'link', title: 'Instagram Portfolio', description: 'Follow @arteform_', skills_used: ['Social Media'], is_featured: false, thumbnail_url: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800', external_url: 'https://instagram.com/arteform_', display_order: 7, view_count: 445 }
  ]

  const { data: portfolio, error: portfolioError } = await supabase
    .from('portfolio_items')
    .insert(portfolioItems)
    .select()

  if (portfolioError) {
    console.log(`⚠️ Portfolio error: ${portfolioError.message}`)
  } else {
    console.log(`✅ Created ${portfolio.length} portfolio items`)
  }

  // 5. Create service and packages
  console.log('\nCreating service and packages...')
  await supabase.from('services').delete().eq('owner_id', arteformUser.id)

  const { data: service, error: serviceError } = await supabase
    .from('services')
    .insert({
      owner_id: arteformUser.id,
      title: 'Studio & Event Space Hire',
      description: 'Brutalist-inspired studio for photography, content creation, brand activations, and events.',
      category: 'Venue',
      subcategory: 'Studio',
      starting_price: 350,
      is_active: true,
      is_featured: true
    })
    .select()
    .single()

  if (serviceError) {
    console.log(`⚠️ Service error: ${serviceError.message}`)
  } else {
    console.log(`✅ Created service: ${service.title}`)

    const packages = [
      { service_id: service.id, tier: 'basic', name: 'Podcast/Content Package', description: '3 hours - Podcast recording or content creation.', price: 350, delivery_time_days: 1, features: ['Acoustic-treated space', 'Professional microphone setup', 'Ring lights'], is_popular: false },
      { service_id: service.id, tier: 'standard', name: 'Half Day Studio Hire', description: '4 hours - Perfect for quick shoots.', price: 450, delivery_time_days: 1, features: ['Professional lighting', 'Bluetooth speaker', 'WiFi', 'Pet-friendly'], is_popular: true },
      { service_id: service.id, tier: 'premium', name: 'Full Day + Event Package', description: '8+ hours - Full venue access for events.', price: 1500, delivery_time_days: 1, features: ['Full venue', 'Up to 80 guests', 'Event lighting', 'Sound system'], is_popular: false }
    ]

    const { data: pkgs, error: pkgError } = await supabase
      .from('service_packages')
      .insert(packages)
      .select()

    if (pkgError) {
      console.log(`⚠️ Packages error: ${pkgError.message}`)
    } else {
      console.log(`✅ Created ${pkgs.length} service packages`)
    }
  }

  // 6. Add badges
  console.log('\nAdding badges...')
  await supabase.from('user_badges').delete().eq('user_id', arteformUser.id)

  const badges = [
    { user_id: arteformUser.id, badge_type: 'identity_verified', awarded_reason: 'Verified venue owner' },
    { user_id: arteformUser.id, badge_type: 'email_verified', awarded_reason: 'Email verified' },
    { user_id: arteformUser.id, badge_type: 'top_rated', awarded_reason: '47 completed, 4.9 rating' },
    { user_id: arteformUser.id, badge_type: 'fast_responder', awarded_reason: 'Responds within 2 hours' }
  ]

  const { data: badgeData, error: badgeError } = await supabase
    .from('user_badges')
    .insert(badges)
    .select()

  if (badgeError) {
    console.log(`⚠️ Badges error: ${badgeError.message}`)
  } else {
    console.log(`✅ Assigned ${badgeData.length} badges`)
  }

  console.log('\n═══════════════════════════════════════════════════════')
  console.log('  ✅ ARTÈFORM Studios profile is now demo-ready!')
  console.log('')
  console.log('  Login: admin@arteform.com.au / TestPassword123!')
  console.log('  Instagram: @arteform_')
  console.log('  Website: https://arteform.com.au/')
  console.log('═══════════════════════════════════════════════════════')
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
