/**
 * Skills API
 *
 * Handles skills, specializations, and endorsements
 * Based on Upwork's category/skill system and Fiverr's skill tags
 *
 * Sources:
 * - https://support.upwork.com/hc/en-us/articles/360024526754-Profile-categories-and-skills
 * - https://support.upwork.com/hc/en-us/articles/115013750068-Create-a-Specialized-Profile
 */

import { supabase } from '../lib/supabase'

// Types
export type SkillProficiency = 'beginner' | 'intermediate' | 'expert'

export interface Skill {
  id: string
  name: string
  category: string
  subcategory: string | null
  icon: string | null
  color: string | null
  usage_count: number
  created_at: string
}

export interface UserSkill {
  id: string
  user_id: string
  skill_id: string
  proficiency: SkillProficiency
  years_experience: number
  is_primary: boolean
  display_order: number
  endorsement_count: number
  created_at: string
  // Joined data
  skill?: Skill
}

export interface SkillEndorsement {
  id: string
  user_skill_id: string
  endorsed_by: string
  created_at: string
  // Joined data
  endorser_profile?: {
    id: string
    display_name: string
    avatar_url: string
  }
}

// ============================================================================
// SKILLS (Master List)
// ============================================================================

/**
 * Get all available skills
 */
export async function getAllSkills(): Promise<Skill[]> {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('category')
    .order('name')

  if (error) throw error
  return data as Skill[]
}

/**
 * Get skills by category
 */
export async function getSkillsByCategory(category: string): Promise<Skill[]> {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('category', category)
    .order('name')

  if (error) throw error
  return data as Skill[]
}

/**
 * Get all skill categories
 */
export async function getSkillCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('skills')
    .select('category')
    .order('category')

  if (error) throw error

  // Get unique categories
  const categories = [...new Set(data.map((s: { category: string }) => s.category))]
  return categories
}

/**
 * Search skills by name
 */
export async function searchSkills(query: string): Promise<Skill[]> {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('usage_count', { ascending: false })
    .limit(20)

  if (error) throw error
  return data as Skill[]
}

/**
 * Get popular skills
 */
export async function getPopularSkills(limit = 10): Promise<Skill[]> {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('usage_count', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as Skill[]
}

// ============================================================================
// USER SKILLS
// ============================================================================

/**
 * Get all skills for a user
 */
export async function getUserSkills(userId: string): Promise<UserSkill[]> {
  const { data, error } = await supabase
    .from('user_skills')
    .select(`
      *,
      skill:skills(*)
    `)
    .eq('user_id', userId)
    .order('is_primary', { ascending: false })
    .order('display_order', { ascending: true })

  if (error) throw error
  return data as UserSkill[]
}

/**
 * Get primary skills for a user (top highlighted skills)
 */
export async function getPrimarySkills(userId: string): Promise<UserSkill[]> {
  const { data, error } = await supabase
    .from('user_skills')
    .select(`
      *,
      skill:skills(*)
    `)
    .eq('user_id', userId)
    .eq('is_primary', true)
    .order('display_order', { ascending: true })
    .limit(5)

  if (error) throw error
  return data as UserSkill[]
}

/**
 * Add a skill to user's profile
 */
export async function addUserSkill(
  userId: string,
  skillId: string,
  proficiency: SkillProficiency = 'intermediate',
  yearsExperience = 0,
  isPrimary = false
): Promise<UserSkill> {
  // Get the next display order
  const { data: existing } = await supabase
    .from('user_skills')
    .select('display_order')
    .eq('user_id', userId)
    .order('display_order', { ascending: false })
    .limit(1)

  const nextOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 0

  const { data, error } = await supabase
    .from('user_skills')
    .insert({
      user_id: userId,
      skill_id: skillId,
      proficiency,
      years_experience: yearsExperience,
      is_primary: isPrimary,
      display_order: nextOrder,
    })
    .select(`
      *,
      skill:skills(*)
    `)
    .single()

  if (error) throw error

  // Increment skill usage count
  await supabase.rpc('increment_skill_usage', { p_skill_id: skillId })

  return data as UserSkill
}

/**
 * Update a user skill
 */
export async function updateUserSkill(
  userSkillId: string,
  updates: {
    proficiency?: SkillProficiency
    years_experience?: number
    is_primary?: boolean
    display_order?: number
  }
): Promise<UserSkill> {
  const { data, error } = await supabase
    .from('user_skills')
    .update(updates)
    .eq('id', userSkillId)
    .select(`
      *,
      skill:skills(*)
    `)
    .single()

  if (error) throw error
  return data as UserSkill
}

/**
 * Remove a skill from user's profile
 */
export async function removeUserSkill(userSkillId: string): Promise<void> {
  const { error } = await supabase
    .from('user_skills')
    .delete()
    .eq('id', userSkillId)

  if (error) throw error
}

/**
 * Reorder user skills
 */
export async function reorderUserSkills(
  userId: string,
  orderedIds: string[]
): Promise<void> {
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from('user_skills')
      .update({ display_order: i })
      .eq('id', orderedIds[i])
      .eq('user_id', userId)

    if (error) throw error
  }
}

/**
 * Set primary skills (max 5)
 */
export async function setPrimarySkills(
  userId: string,
  userSkillIds: string[]
): Promise<void> {
  // First, unset all primary skills
  await supabase
    .from('user_skills')
    .update({ is_primary: false })
    .eq('user_id', userId)

  // Then set the selected ones as primary (max 5)
  const primaryIds = userSkillIds.slice(0, 5)
  for (const id of primaryIds) {
    await supabase
      .from('user_skills')
      .update({ is_primary: true })
      .eq('id', id)
      .eq('user_id', userId)
  }
}

// ============================================================================
// ENDORSEMENTS
// ============================================================================

/**
 * Get endorsements for a user skill
 */
export async function getSkillEndorsements(userSkillId: string): Promise<SkillEndorsement[]> {
  const { data, error } = await supabase
    .from('skill_endorsements')
    .select(`
      *,
      endorser_profile:profiles!endorsed_by(id, display_name, avatar_url)
    `)
    .eq('user_skill_id', userSkillId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as SkillEndorsement[]
}

/**
 * Endorse a user's skill
 */
export async function endorseSkill(
  userSkillId: string,
  endorsedBy: string
): Promise<SkillEndorsement> {
  const { data, error } = await supabase
    .from('skill_endorsements')
    .insert({
      user_skill_id: userSkillId,
      endorsed_by: endorsedBy,
    })
    .select()
    .single()

  if (error) throw error

  // Update endorsement count
  await supabase.rpc('increment_endorsement_count', { p_user_skill_id: userSkillId })

  return data as SkillEndorsement
}

/**
 * Remove an endorsement
 */
export async function removeEndorsement(
  userSkillId: string,
  endorsedBy: string
): Promise<void> {
  const { error } = await supabase
    .from('skill_endorsements')
    .delete()
    .eq('user_skill_id', userSkillId)
    .eq('endorsed_by', endorsedBy)

  if (error) throw error

  // Decrement endorsement count
  await supabase.rpc('decrement_endorsement_count', { p_user_skill_id: userSkillId })
}

/**
 * Check if user has endorsed a skill
 */
export async function hasEndorsed(
  userSkillId: string,
  endorsedBy: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('skill_endorsements')
    .select('id')
    .eq('user_skill_id', userSkillId)
    .eq('endorsed_by', endorsedBy)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return !!data
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get proficiency display info
 */
export function getProficiencyInfo(proficiency: SkillProficiency): {
  label: string
  color: string
  bgColor: string
} {
  const levels = {
    beginner: {
      label: 'Beginner',
      color: 'text-yellow-700 dark:text-yellow-300',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    intermediate: {
      label: 'Intermediate',
      color: 'text-blue-700 dark:text-blue-300',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    expert: {
      label: 'Expert',
      color: 'text-green-700 dark:text-green-300',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
  }
  return levels[proficiency]
}

/**
 * Group skills by category
 */
export function groupSkillsByCategory(skills: Skill[]): Record<string, Skill[]> {
  return skills.reduce((acc, skill) => {
    const category = skill.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)
}
