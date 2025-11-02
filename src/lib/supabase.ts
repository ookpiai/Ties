import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type Profile = {
  id: string
  display_name: string
  role: 'Artist' | 'Crew' | 'Venue' | 'Organiser'
  avatar_url: string | null
  bio: string | null
  city: string | null
  created_at: string
}

export type Service = {
  id: string
  owner_id: string
  title: string
  price_min: number | null
  price_max: number | null
  tags: string[] | null
  created_at: string
}

export type Project = {
  id: string
  owner_id: string
  title: string
  description: string | null
  status: string
  city: string | null
  created_at: string
}

export type Message = {
  id: string
  from_id: string | null
  to_id: string | null
  body: string
  created_at: string
}

export type Booking = {
  id: string
  organiser_id: string | null
  talent_id: string | null
  project_id: string | null
  status: 'requested' | 'accepted' | 'declined' | 'completed'
  amount: number | null
  created_at: string
}

export type Review = {
  id: string
  about_user_id: string
  by_user_id: string
  rating: number
  text: string | null
  created_at: string
}
