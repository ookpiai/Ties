import { supabase, Review } from '../lib/supabase'

export async function listReviewsForUser(userId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, by:profiles!reviews_by_user_id_fkey(display_name, avatar_url)')
    .eq('about_user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createReview(review: Omit<Review, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single()

  if (error) throw error
  return data as Review
}

export async function getAverageRating(userId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('about_user_id', userId)

  if (error) throw error
  
  if (!data || data.length === 0) return 0
  
  const sum = data.reduce((acc, review) => acc + review.rating, 0)
  return sum / data.length
}
