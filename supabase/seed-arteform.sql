-- ARTÈFORM STUDIOS PROFILE SEED
-- Populates a complete, demo-ready profile for Arteform Studios
-- A brutalist-inspired studio and event space on the Gold Coast

-- First, find or create the user profile
-- We'll use ON CONFLICT to handle existing records

DO $$
DECLARE
  arteform_user_id UUID;
BEGIN
  -- Try to find existing user by username
  SELECT id INTO arteform_user_id
  FROM profiles
  WHERE username = 'arteformstudios'
  LIMIT 1;

  -- If not found, check auth.users for the email
  IF arteform_user_id IS NULL THEN
    SELECT id INTO arteform_user_id
    FROM auth.users
    WHERE email = 'admin@arteform.com.au'
    LIMIT 1;
  END IF;

  -- If still not found, we need to create via auth (will be done separately)
  IF arteform_user_id IS NULL THEN
    RAISE NOTICE 'Arteform user not found. Creating new auth user...';
    -- Generate a new UUID for the user
    arteform_user_id := gen_random_uuid();

    -- Insert into auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at,
      aud,
      role
    ) VALUES (
      arteform_user_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@arteform.com.au',
      crypt('TestPassword123!', gen_salt('bf')),
      NOW(),
      '{"display_name": "ARTÈFORM Studios", "role": "Venue"}'::jsonb,
      NOW(),
      NOW(),
      'authenticated',
      'authenticated'
    );

    -- Insert into auth.identities
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      provider,
      identity_data,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      arteform_user_id,
      'admin@arteform.com.au',
      'email',
      jsonb_build_object('sub', arteform_user_id::text, 'email', 'admin@arteform.com.au'),
      NOW(),
      NOW(),
      NOW()
    );
  END IF;

  RAISE NOTICE 'Using Arteform user ID: %', arteform_user_id;

  -- Update or insert profile
  INSERT INTO profiles (
    id,
    display_name,
    username,
    role,
    specialty,
    headline,
    tagline,
    bio,
    city,
    country,
    website,
    hourly_rate,
    daily_rate,
    social_links,
    languages,
    is_verified,
    is_available,
    updated_at
  ) VALUES (
    arteform_user_id,
    'ARTÈFORM Studios',
    'arteformstudios',
    'Venue',
    'studio',
    'Brutalist-Inspired Studio & Event Space',
    'Shoot. Launch. Curate.',
    E'ARTÈFORM is a brutalist-inspired studio and event space for visionaries, creatives and modern brands.\n\nWe blend raw aesthetics with refined design — a blank canvas for creators, lovers and brands to build something unforgettable.\n\nLocated in Miami, Gold Coast, our space offers professional studio lighting, premium audio equipment, and a curated atmosphere perfect for:\n\n• Photography & Fashion Shoots\n• Brand Launches & Activations\n• Content Creation & Podcasts\n• Private Events & Intimate Weddings\n• Creative Workshops & Gatherings\n\nOur space is pet-friendly with street parking available nearby. We believe in evolving with our community — every shoot, launch and event adds to the energy of ARTÈFORM.',
    'Gold Coast, QLD',
    'Australia',
    'https://arteform.com.au/',
    150,
    900,
    '{"instagram": "arteform_", "tiktok": "arteformstudios"}'::jsonb,
    '[{"language": "English", "level": "Native"}]'::jsonb,
    true,
    true,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    username = EXCLUDED.username,
    role = EXCLUDED.role,
    specialty = EXCLUDED.specialty,
    headline = EXCLUDED.headline,
    tagline = EXCLUDED.tagline,
    bio = EXCLUDED.bio,
    city = EXCLUDED.city,
    country = EXCLUDED.country,
    website = EXCLUDED.website,
    hourly_rate = EXCLUDED.hourly_rate,
    daily_rate = EXCLUDED.daily_rate,
    social_links = EXCLUDED.social_links,
    languages = EXCLUDED.languages,
    is_verified = EXCLUDED.is_verified,
    is_available = EXCLUDED.is_available,
    updated_at = NOW();

  -- Clear existing portfolio items
  DELETE FROM portfolio_items WHERE user_id = arteform_user_id;

  -- Insert portfolio items
  INSERT INTO portfolio_items (user_id, type, title, description, skills_used, is_featured, thumbnail_url, media_url, display_order, view_count, created_at) VALUES
  (arteform_user_id, 'image', 'Brutalist Studio Interior', 'Our signature raw concrete and natural light aesthetic. The main studio space features floor-to-ceiling windows and industrial finishes.', ARRAY['Studio Design', 'Interior Photography', 'Natural Lighting'], true, 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600', 0, 347, NOW() - INTERVAL '45 days'),
  (arteform_user_id, 'image', 'Fashion Shoot Setup', 'Professional lighting configuration for fashion photography. Our studio includes Godox and Aputure lighting systems.', ARRAY['Fashion Photography', 'Studio Lighting', 'Set Design'], true, 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1600', 1, 289, NOW() - INTERVAL '38 days'),
  (arteform_user_id, 'image', 'Brand Activation Event', 'Recent product launch event. The space transforms beautifully for intimate brand experiences with up to 80 guests.', ARRAY['Event Hosting', 'Brand Activations', 'Product Launches'], false, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600', 2, 198, NOW() - INTERVAL '30 days'),
  (arteform_user_id, 'image', 'Content Creation Corner', 'Dedicated podcast and content creation setup with professional acoustic treatment and lighting.', ARRAY['Podcast Recording', 'Content Creation', 'Audio Setup'], false, 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800', 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1600', 3, 156, NOW() - INTERVAL '22 days'),
  (arteform_user_id, 'image', 'Intimate Wedding Setup', 'Our space configured for an intimate wedding ceremony. Perfect for couples seeking a unique, modern venue.', ARRAY['Wedding Venue', 'Event Styling', 'Intimate Ceremonies'], true, 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600', 4, 423, NOW() - INTERVAL '15 days'),
  (arteform_user_id, 'video', 'ARTÈFORM Studio Tour', 'Take a virtual tour of our brutalist-inspired creative space. See how the natural light transforms throughout the day.', ARRAY['Videography', 'Studio Tour', 'Space Design'], false, 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800', NULL, 5, 512, NOW() - INTERVAL '60 days'),
  (arteform_user_id, 'video', 'Behind the Scenes - Fashion Shoot', 'Watch how our space comes alive during a professional fashion photography session.', ARRAY['Fashion Photography', 'Behind the Scenes', 'Studio Work'], false, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', NULL, 6, 234, NOW() - INTERVAL '25 days'),
  (arteform_user_id, 'link', 'ARTÈFORM Website', 'Visit our official website to view our full gallery, pricing, and booking calendar.', ARRAY['Web Presence', 'Brand Identity'], false, 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', NULL, 7, 678, NOW() - INTERVAL '90 days'),
  (arteform_user_id, 'link', 'Instagram Portfolio', 'Follow @arteform_ for the latest shoots, events, and studio inspiration.', ARRAY['Social Media', 'Visual Portfolio'], false, 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800', NULL, 8, 445, NOW() - INTERVAL '80 days');

  -- Update external URLs for video/link items
  UPDATE portfolio_items SET external_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', external_platform = 'youtube' WHERE user_id = arteform_user_id AND title = 'ARTÈFORM Studio Tour';
  UPDATE portfolio_items SET external_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', external_platform = 'youtube' WHERE user_id = arteform_user_id AND title = 'Behind the Scenes - Fashion Shoot';
  UPDATE portfolio_items SET external_url = 'https://arteform.com.au/' WHERE user_id = arteform_user_id AND title = 'ARTÈFORM Website';
  UPDATE portfolio_items SET external_url = 'https://instagram.com/arteform_' WHERE user_id = arteform_user_id AND title = 'Instagram Portfolio';

  -- Clear and insert service packages
  DELETE FROM service_packages WHERE user_id = arteform_user_id;

  INSERT INTO service_packages (user_id, name, description, price, duration_hours, features, is_popular, is_active, display_order, created_at) VALUES
  (arteform_user_id, 'Half Day Studio Hire', 'Perfect for quick shoots and content creation. Includes professional lighting setup and Bluetooth audio.', 450, 4, ARRAY['Professional studio lighting included', 'Bluetooth-connected JBL speaker', 'WiFi access', 'Street parking available', 'Pet-friendly', 'Walkthrough for lighting setup'], false, true, 0, NOW()),
  (arteform_user_id, 'Full Day Studio Hire', 'Our most popular option. Full access to the studio for an entire day, perfect for larger shoots or events.', 900, 8, ARRAY['Everything in Half Day', 'Early access setup available', 'Multiple lighting configurations', 'Flexible room layouts', 'Equipment storage space', 'Catering delivery accepted'], true, true, 1, NOW()),
  (arteform_user_id, 'Event Package', 'Transform our space for your brand launch, private event, or intimate wedding. Includes setup and breakdown time.', 1500, 12, ARRAY['Full venue access', 'Capacity up to 80 guests', 'Event lighting options', 'Sound system setup', 'Early setup time included', 'Event coordinator support'], false, true, 2, NOW()),
  (arteform_user_id, 'Podcast/Content Package', 'Specialized setup for podcast recording or content creation with acoustic treatment and professional audio.', 350, 3, ARRAY['Acoustic-treated space', 'Professional microphone setup', 'Ring lights and key lighting', 'Backdrop options', 'USB-C charging stations', 'Quiet recording environment'], false, true, 3, NOW());

  -- Clear and insert skills
  DELETE FROM user_skills WHERE user_id = arteform_user_id;

  INSERT INTO user_skills (user_id, name, category, years_experience, is_primary, endorsement_count, created_at) VALUES
  (arteform_user_id, 'Studio Photography', 'creative', 5, true, 18, NOW()),
  (arteform_user_id, 'Event Hosting', 'events', 5, true, 23, NOW()),
  (arteform_user_id, 'Brand Activations', 'marketing', 4, true, 15, NOW()),
  (arteform_user_id, 'Wedding Venue', 'events', 3, false, 12, NOW()),
  (arteform_user_id, 'Content Creation Space', 'creative', 4, false, 9, NOW()),
  (arteform_user_id, 'Podcast Recording', 'audio', 3, false, 7, NOW()),
  (arteform_user_id, 'Fashion Photography', 'creative', 4, false, 14, NOW()),
  (arteform_user_id, 'Product Photography', 'creative', 5, false, 11, NOW()),
  (arteform_user_id, 'Video Production', 'creative', 4, false, 8, NOW()),
  (arteform_user_id, 'Workshop Hosting', 'events', 3, false, 6, NOW());

  -- Insert or update profile stats
  INSERT INTO profile_stats (user_id, total_projects, total_reviews, average_rating, response_rate, response_time_hours, repeat_client_rate, profile_views, profile_views_this_month, last_active, updated_at)
  VALUES (arteform_user_id, 47, 23, 4.9, 98, 2, 65, 1250, 180, NOW(), NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    total_projects = 47,
    total_reviews = 23,
    average_rating = 4.9,
    response_rate = 98,
    response_time_hours = 2,
    repeat_client_rate = 65,
    profile_views = 1250,
    profile_views_this_month = 180,
    last_active = NOW(),
    updated_at = NOW();

  RAISE NOTICE '✅ ARTÈFORM Studios profile seeded successfully!';
  RAISE NOTICE 'User ID: %', arteform_user_id;

END $$;

-- Output success message
SELECT
  id,
  display_name,
  username,
  role,
  city,
  website,
  social_links->>'instagram' as instagram
FROM profiles
WHERE username = 'arteformstudios';
