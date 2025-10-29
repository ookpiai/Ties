import { supabase } from '../lib/supabase'

export async function uploadAvatar(file: File, userId: string) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function deleteAvatar(url: string) {
  const path = url.split('/avatars/')[1]
  if (!path) return

  const { error } = await supabase.storage
    .from('avatars')
    .remove([`avatars/${path}`])

  if (error) throw error
}
