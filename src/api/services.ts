import { supabase, Service } from '../lib/supabase'

export async function listServices(searchQuery?: string) {
  let query = supabase
    .from('services')
    .select('*, profiles!services_owner_id_fkey(display_name, avatar_url)')
    .order('created_at', { ascending: false })

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getService(id: string) {
  const { data, error} = await supabase
    .from('services')
    .select('*, profiles!services_owner_id_fkey(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createService(service: Omit<Service, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('services')
    .insert(service)
    .select()
    .single()

  if (error) throw error
  return data as Service
}

export async function updateService(id: string, updates: Partial<Service>) {
  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Service
}

export async function deleteService(id: string) {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)

  if (error) throw error
}
