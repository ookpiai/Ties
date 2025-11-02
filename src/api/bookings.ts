import { supabase, Booking } from '../lib/supabase'

export async function listMyBookings(userId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, organiser:profiles!bookings_organiser_id_fkey(display_name, avatar_url), talent:profiles!bookings_talent_id_fkey(display_name, avatar_url)')
    .or(`organiser_id.eq.${userId},talent_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'status'>) {
  const { data, error } = await supabase
    .from('bookings')
    .insert({ ...booking, status: 'requested' })
    .select()
    .single()

  if (error) throw error
  return data as Booking
}

export async function updateBookingStatus(id: string, status: Booking['status']) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Booking
}
