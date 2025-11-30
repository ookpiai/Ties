/**
 * Skills Display Components - Premium SaaS Edition
 *
 * Modern skills display with glassmorphism, gradients, and premium aesthetics
 * Inspired by Upwork's skill system and modern SaaS design
 */

import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Plus,
  X,
  Star,
  ThumbsUp,
  Edit2,
  Loader2,
  Sparkles,
  Search,
  GripVertical,
  Check,
  Zap,
  Award,
  TrendingUp,
} from 'lucide-react'
import {
  getUserSkills,
  getPrimarySkills,
  addUserSkill,
  updateUserSkill,
  removeUserSkill,
  getAllSkills,
  searchSkills,
  endorseSkill,
  removeEndorsement,
  hasEndorsed,
  getProficiencyInfo,
  groupSkillsByCategory,
} from '../../../api/skills'

// Proficiency config with gradients
const PROFICIENCY_CONFIG = {
  beginner: {
    gradient: 'from-slate-400 to-slate-500',
    bgGradient: 'from-slate-400/10 to-slate-500/10',
    ring: 'ring-slate-400/20',
    text: 'text-slate-600 dark:text-slate-400',
    label: 'Beginner',
  },
  intermediate: {
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
    ring: 'ring-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    label: 'Intermediate',
  },
  expert: {
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-500/10 to-pink-500/10',
    ring: 'ring-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    label: 'Expert',
  },
}

/**
 * Skills Row - Compact display with premium pill design
 */
export const SkillsRow = ({ userId, skills: propSkills, maxDisplay = 5, showAll = false }) => {
  const [skills, setSkills] = useState(propSkills || [])
  const [isLoading, setIsLoading] = useState(!propSkills)

  useEffect(() => {
    if (propSkills) {
      setSkills(propSkills)
      return
    }

    const loadSkills = async () => {
      if (!userId) return
      setIsLoading(true)
      try {
        const data = showAll
          ? await getUserSkills(userId)
          : await getPrimarySkills(userId)
        setSkills(data)
      } catch (error) {
        console.error('Failed to load skills:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadSkills()
  }, [userId, showAll, propSkills])

  if (isLoading || skills.length === 0) return null

  const displaySkills = skills.slice(0, maxDisplay)
  const remainingCount = skills.length - maxDisplay

  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-2">
        {displaySkills.map((userSkill, index) => {
          const config = PROFICIENCY_CONFIG[userSkill.proficiency] || PROFICIENCY_CONFIG.beginner
          return (
            <Tooltip key={userSkill.id}>
              <TooltipTrigger>
                <span
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5
                    rounded-full text-sm font-medium
                    bg-gradient-to-r ${config.bgGradient}
                    ${config.text}
                    border border-white/50 dark:border-slate-700/50
                    backdrop-blur-sm
                    shadow-sm
                    transition-all duration-300
                    hover:shadow-md hover:-translate-y-0.5
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {userSkill.skill?.name}
                  {userSkill.is_primary && (
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  )}
                </span>
              </TooltipTrigger>
              <TooltipContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50">
                <div className="space-y-1.5 p-1">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {userSkill.skill?.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className={`px-2 py-0.5 rounded-full bg-gradient-to-r ${config.bgGradient} ${config.text} font-medium`}>
                      {config.label}
                    </span>
                    {userSkill.years_experience > 0 && (
                      <span>{userSkill.years_experience} years</span>
                    )}
                  </div>
                  {userSkill.endorsement_count > 0 && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {userSkill.endorsement_count} endorsement{userSkill.endorsement_count !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}
        {remainingCount > 0 && (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            +{remainingCount} more
          </span>
        )}
      </div>
    </TooltipProvider>
  )
}

/**
 * Full Skills Card - Premium detailed display
 */
export const SkillsCard = ({
  userId,
  skills: propSkills,
  isOwner = false,
  currentUserId,
  onEdit,
  onEndorse,
}) => {
  const [skills, setSkills] = useState(propSkills || [])
  const [isLoading, setIsLoading] = useState(!propSkills)
  const [endorsedSkills, setEndorsedSkills] = useState({})

  useEffect(() => {
    if (propSkills) {
      setSkills(propSkills)
      return
    }

    const loadSkills = async () => {
      if (!userId) return
      setIsLoading(true)
      try {
        const data = await getUserSkills(userId)
        setSkills(data)

        if (currentUserId && !isOwner) {
          const endorsedMap = {}
          for (const skill of data) {
            endorsedMap[skill.id] = await hasEndorsed(skill.id, currentUserId)
          }
          setEndorsedSkills(endorsedMap)
        }
      } catch (error) {
        console.error('Failed to load skills:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadSkills()
  }, [userId, currentUserId, isOwner, propSkills])

  const handleEndorse = async (userSkillId) => {
    if (!currentUserId || !onEndorse) return
    try {
      if (endorsedSkills[userSkillId]) {
        await removeEndorsement(userSkillId, currentUserId)
        setEndorsedSkills({ ...endorsedSkills, [userSkillId]: false })
        setSkills(
          skills.map((s) =>
            s.id === userSkillId ? { ...s, endorsement_count: s.endorsement_count - 1 } : s
          )
        )
      } else {
        await endorseSkill(userSkillId, currentUserId)
        setEndorsedSkills({ ...endorsedSkills, [userSkillId]: true })
        setSkills(
          skills.map((s) =>
            s.id === userSkillId ? { ...s, endorsement_count: s.endorsement_count + 1 } : s
          )
        )
      }
    } catch (error) {
      console.error('Failed to toggle endorsement:', error)
    }
  }

  if (isLoading) {
    return (
      <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 rounded-2xl">
        <CardContent className="flex items-center justify-center py-12">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <Sparkles className="w-4 h-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (skills.length === 0) {
    return (
      <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
        <CardContent className="py-12 text-center relative z-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
            {isOwner ? 'Showcase Your Skills' : 'No Skills Listed'}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto">
            {isOwner
              ? 'Add your skills and expertise to attract more clients and get discovered'
              : "This user hasn't added any skills yet"}
          </p>
          {isOwner && (
            <Button
              onClick={onEdit}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/25"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Skills
            </Button>
          )}
        </CardContent>
        {/* Decorative gradient orbs */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl" />
      </Card>
    )
  }

  const primarySkills = skills.filter((s) => s.is_primary)
  const otherSkills = skills.filter((s) => !s.is_primary)

  return (
    <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-500">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10">
            <Award className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-lg font-semibold">Skills & Expertise</CardTitle>
        </div>
        {isOwner && (
          <Button variant="outline" size="sm" onClick={onEdit} className="rounded-xl">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Skills */}
        {primarySkills.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Top Skills
              </h4>
            </div>
            <div className="space-y-2.5">
              {primarySkills.map((userSkill, index) => (
                <SkillItem
                  key={userSkill.id}
                  userSkill={userSkill}
                  canEndorse={!isOwner && !!onEndorse}
                  isEndorsed={endorsedSkills[userSkill.id]}
                  onEndorse={() => handleEndorse(userSkill.id)}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}

        {/* Other Skills */}
        {otherSkills.length > 0 && (
          <div>
            {primarySkills.length > 0 && (
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Other Skills
              </h4>
            )}
            <div className="flex flex-wrap gap-2">
              {otherSkills.map((userSkill, index) => {
                const config = PROFICIENCY_CONFIG[userSkill.proficiency] || PROFICIENCY_CONFIG.beginner
                return (
                  <TooltipProvider key={userSkill.id}>
                    <Tooltip>
                      <TooltipTrigger>
                        <span
                          className={`
                            inline-flex items-center gap-1.5 px-3 py-1.5
                            rounded-full text-sm font-medium
                            bg-gradient-to-r ${config.bgGradient}
                            ${config.text}
                            backdrop-blur-sm
                            transition-all duration-300
                            hover:shadow-md hover:-translate-y-0.5
                          `}
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          {userSkill.skill?.name}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{config.label}</p>
                        {userSkill.years_experience > 0 && (
                          <p className="text-xs text-slate-500">{userSkill.years_experience} years experience</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>

      {/* Subtle gradient accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-full blur-2xl" />
    </Card>
  )
}

/**
 * Premium Skill Item with glassmorphism
 */
const SkillItem = ({ userSkill, canEndorse, isEndorsed, onEndorse, index = 0 }) => {
  const config = PROFICIENCY_CONFIG[userSkill.proficiency] || PROFICIENCY_CONFIG.beginner

  return (
    <div
      className={`
        flex items-center justify-between p-4
        bg-gradient-to-r from-slate-50/80 to-slate-100/50 dark:from-slate-800/80 dark:to-slate-800/50
        backdrop-blur-sm
        rounded-xl
        border border-slate-200/50 dark:border-slate-700/50
        transition-all duration-300
        hover:shadow-md hover:-translate-y-0.5
      `}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-4">
        <div
          className={`
            w-12 h-12 rounded-xl flex items-center justify-center
            bg-gradient-to-br ${config.bgGradient}
            shadow-sm
          `}
        >
          <TrendingUp className={`w-5 h-5 ${config.text}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-white">
              {userSkill.skill?.name}
            </span>
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-medium
              bg-gradient-to-r ${config.bgGradient} ${config.text}
            `}>
              {config.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            {userSkill.years_experience > 0 && (
              <span>{userSkill.years_experience} years</span>
            )}
            {userSkill.endorsement_count > 0 && (
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                {userSkill.endorsement_count} endorsement{userSkill.endorsement_count !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
      {canEndorse && (
        <Button
          variant={isEndorsed ? 'default' : 'outline'}
          size="sm"
          onClick={onEndorse}
          className={`
            rounded-xl transition-all duration-300
            ${isEndorsed
              ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/25'
              : 'hover:bg-primary/5'
            }
          `}
        >
          <ThumbsUp className={`w-4 h-4 ${isEndorsed ? 'fill-current' : ''}`} />
        </Button>
      )}
    </div>
  )
}

/**
 * Premium Skills Editor Modal
 */
export const SkillsEditorModal = ({ isOpen, onClose, userId, currentSkills, onSuccess }) => {
  const [userSkills, setUserSkills] = useState(currentSkills || [])
  const [availableSkills, setAvailableSkills] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!userId) return
      setIsLoading(true)
      try {
        const [skills, allSkills] = await Promise.all([
          currentSkills ? Promise.resolve(currentSkills) : getUserSkills(userId),
          getAllSkills(),
        ])
        setUserSkills(skills)
        setAvailableSkills(allSkills)
      } catch (error) {
        console.error('Failed to load skills:', error)
      } finally {
        setIsLoading(false)
      }
    }
    if (isOpen) {
      loadData()
    }
  }, [isOpen, userId, currentSkills])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const filtered = availableSkills.filter(
      (skill) =>
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !userSkills.find((us) => us.skill_id === skill.id)
    )
    setSearchResults(filtered.slice(0, 10))
  }, [searchQuery, availableSkills, userSkills])

  const handleAddSkill = async (skill) => {
    try {
      const newUserSkill = await addUserSkill(userId, skill.id)
      setUserSkills([...userSkills, { ...newUserSkill, skill }])
      setSearchQuery('')
    } catch (error) {
      console.error('Failed to add skill:', error)
    }
  }

  const handleRemoveSkill = async (userSkillId) => {
    try {
      await removeUserSkill(userSkillId)
      setUserSkills(userSkills.filter((s) => s.id !== userSkillId))
    } catch (error) {
      console.error('Failed to remove skill:', error)
    }
  }

  const handleUpdateSkill = async (userSkillId, updates) => {
    try {
      const updated = await updateUserSkill(userSkillId, updates)
      setUserSkills(userSkills.map((s) => (s.id === userSkillId ? { ...s, ...updated } : s)))
    } catch (error) {
      console.error('Failed to update skill:', error)
    }
  }

  const handleSave = () => {
    onSuccess?.()
    onClose()
  }

  const groupedSkills = groupSkillsByCategory(availableSkills)
  const primaryCount = userSkills.filter((s) => s.is_primary).length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Skills & Expertise</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Add skills to showcase your expertise. Mark up to 5 skills as primary to highlight them.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <Sparkles className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Search Skills */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Add Skills</Label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search skills..."
                  className="pl-11 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-2 space-y-1 max-h-48 overflow-y-auto bg-white dark:bg-slate-900">
                  {searchResults.map((skill) => (
                    <button
                      key={skill.id}
                      onClick={() => handleAddSkill(skill)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Plus className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-xs text-slate-500 ml-auto px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                        {skill.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Browse by Category */}
              {!searchQuery && (
                <div className="space-y-4 mt-4">
                  <p className="text-sm text-slate-500">Or browse by category:</p>
                  <div className="space-y-3">
                    {Object.entries(groupedSkills).slice(0, 4).map(([category, categorySkills]) => (
                      <div key={category}>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          {category}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {categorySkills
                            .filter((s) => !userSkills.find((us) => us.skill_id === s.id))
                            .slice(0, 6)
                            .map((skill) => (
                              <button
                                key={skill.id}
                                onClick={() => handleAddSkill(skill)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                                {skill.name}
                              </button>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Current Skills */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Your Skills ({userSkills.length})</Label>
                <span className="text-xs text-slate-500">
                  {primaryCount}/5 primary skills
                </span>
              </div>
              {userSkills.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No skills added yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {userSkills.map((userSkill, index) => {
                    const config = PROFICIENCY_CONFIG[userSkill.proficiency] || PROFICIENCY_CONFIG.beginner
                    return (
                      <div
                        key={userSkill.id}
                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900 dark:text-white">
                              {userSkill.skill?.name}
                            </span>
                            {userSkill.is_primary && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 text-yellow-700 dark:text-yellow-400 font-medium">
                                Primary
                              </span>
                            )}
                          </div>
                        </div>

                        <Select
                          value={userSkill.proficiency}
                          onValueChange={(value) => handleUpdateSkill(userSkill.id, { proficiency: value })}
                        >
                          <SelectTrigger className="w-32 h-9 text-xs rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant={userSkill.is_primary ? 'default' : 'outline'}
                          size="icon"
                          className={`h-9 w-9 rounded-lg ${userSkill.is_primary ? 'bg-gradient-to-r from-yellow-500 to-amber-500' : ''}`}
                          onClick={() => handleUpdateSkill(userSkill.id, { is_primary: !userSkill.is_primary })}
                          disabled={!userSkill.is_primary && primaryCount >= 5}
                        >
                          <Star className={`w-4 h-4 ${userSkill.is_primary ? 'fill-white text-white' : ''}`} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleRemoveSkill(userSkill.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg shadow-primary/25"
          >
            <Check className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SkillsRow
