/**
 * Enhanced Profile Header Component
 *
 * Premium profile header with all self-promotion features
 * Combines badges, skills, stats, and enhanced bio fields
 *
 * Sources:
 * - https://support.upwork.com/hc/en-us/articles/360016144974-Enhance-your-profile
 * - https://help.fiverr.com/hc/en-us/articles/360010558598-Creating-your-freelancer-profile
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MapPin,
  Edit2,
  Camera,
  Globe,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Link2,
  Plus,
  X,
  Loader2,
  Save,
  Languages,
  Briefcase,
  Calendar,
  CheckCircle,
  Copy,
  ExternalLink,
} from 'lucide-react'
import { TopBadge, BadgeRow, BadgeModal } from './badges'
import { SkillsRow } from './skills'
import { RatingDisplay, MemberSinceBadge, PublicStatsRow } from './stats'
import { supabase } from '../../lib/supabase'

// Language options based on Fiverr's language levels
const LANGUAGE_LEVELS = [
  { value: 'basic', label: 'Basic' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'fluent', label: 'Fluent' },
  { value: 'native', label: 'Native/Bilingual' },
]

const COMMON_LANGUAGES = [
  'English', 'Spanish', 'Mandarin', 'Hindi', 'Arabic', 'Portuguese',
  'French', 'German', 'Japanese', 'Korean', 'Italian', 'Russian',
]

const EnhancedProfileHeader = ({
  profile,
  isOwnProfile = false,
  onProfileUpdate,
}) => {
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [isEditingLanguages, setIsEditingLanguages] = useState(false)
  const [isEditingSocial, setIsEditingSocial] = useState(false)
  const [showBadgeModal, setShowBadgeModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Edit form states
  const [editForm, setEditForm] = useState({
    headline: profile?.headline || '',
    tagline: profile?.tagline || '',
    bio: profile?.bio || '',
    years_experience: profile?.years_experience || 0,
  })

  const [languages, setLanguages] = useState(
    profile?.languages ? JSON.parse(JSON.stringify(profile.languages)) : []
  )

  const [socialLinks, setSocialLinks] = useState(
    profile?.social_links ? JSON.parse(JSON.stringify(profile.social_links)) : {}
  )

  // Update states when profile changes
  useEffect(() => {
    if (profile) {
      setEditForm({
        headline: profile.headline || '',
        tagline: profile.tagline || '',
        bio: profile.bio || '',
        years_experience: profile.years_experience || 0,
      })
      setLanguages(profile.languages ? JSON.parse(JSON.stringify(profile.languages)) : [])
      setSocialLinks(profile.social_links ? JSON.parse(JSON.stringify(profile.social_links)) : {})
    }
  }, [profile])

  const getInitials = () => {
    if (!profile?.display_name) return '??'
    const names = profile.display_name.split(' ')
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
    }
    return profile.display_name.substring(0, 2).toUpperCase()
  }

  // Save bio/headline
  const handleSaveBio = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          headline: editForm.headline || null,
          tagline: editForm.tagline || null,
          bio: editForm.bio || null,
          years_experience: editForm.years_experience || null,
        })
        .eq('id', profile.id)

      if (error) throw error
      onProfileUpdate?.()
      setIsEditingBio(false)
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  // Save languages
  const handleSaveLanguages = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ languages })
        .eq('id', profile.id)

      if (error) throw error
      onProfileUpdate?.()
      setIsEditingLanguages(false)
    } catch (error) {
      console.error('Failed to save languages:', error)
      alert('Failed to save languages')
    } finally {
      setIsSaving(false)
    }
  }

  // Save social links
  const handleSaveSocial = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          social_links: socialLinks,
          website_url: socialLinks.website || null,
        })
        .eq('id', profile.id)

      if (error) throw error
      onProfileUpdate?.()
      setIsEditingSocial(false)
    } catch (error) {
      console.error('Failed to save social links:', error)
      alert('Failed to save social links')
    } finally {
      setIsSaving(false)
    }
  }

  // Add language
  const addLanguage = (language) => {
    if (!languages.find((l) => l.language === language)) {
      setLanguages([...languages, { language, level: 'conversational' }])
    }
  }

  // Remove language
  const removeLanguage = (language) => {
    setLanguages(languages.filter((l) => l.language !== language))
  }

  // Update language level
  const updateLanguageLevel = (language, level) => {
    setLanguages(
      languages.map((l) => (l.language === language ? { ...l, level } : l))
    )
  }

  // Copy booking page URL
  const copyBookingUrl = () => {
    const url = `${window.location.origin}/book/${profile.username}`
    navigator.clipboard.writeText(url)
    alert('Booking page URL copied!')
  }

  if (!profile) return null

  return (
    <>
      <Card className="bg-surface border border-app overflow-hidden">
        {/* Cover/Banner Area */}
        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />

        <CardContent className="relative px-6 pb-6">
          {/* Avatar - Overlapping banner */}
          <div className="absolute -top-16 left-6">
            <Avatar className="w-28 h-28 border-4 border-white dark:border-slate-900 shadow-lg">
              <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
              <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
            </Avatar>
          </div>

          {/* Header Actions */}
          <div className="flex justify-end pt-2 mb-12">
            {isOwnProfile && (
              <div className="flex gap-2">
                {profile.username && (
                  <Button variant="outline" size="sm" onClick={copyBookingUrl}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Booking URL
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setIsEditingBio(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            {/* Name and Badge */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {profile.display_name}
                  </h1>
                  <TopBadge userId={profile.id} />
                </div>
                <p className="text-slate-600 dark:text-slate-400 capitalize mt-1">
                  {profile.role}
                  {profile.years_experience > 0 && (
                    <span className="ml-2">
                      • {profile.years_experience} years experience
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Headline */}
            {profile.headline && (
              <p className="text-lg text-slate-700 dark:text-slate-300 font-medium">
                {profile.headline}
              </p>
            )}

            {/* Tagline */}
            {profile.tagline && (
              <p className="text-slate-600 dark:text-slate-400">
                {profile.tagline}
              </p>
            )}

            {/* Location and Stats Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {profile.city && (
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <MapPin className="w-4 h-4" />
                  {profile.city}
                </div>
              )}
              <PublicStatsRow userId={profile.id} />
              <MemberSinceBadge date={profile.created_at} />
            </div>

            {/* Badges Row */}
            <div className="flex items-center gap-2">
              <BadgeRow
                userId={profile.id}
                maxDisplay={5}
                onViewAll={() => setShowBadgeModal(true)}
              />
            </div>

            {/* Skills Row */}
            <div>
              <SkillsRow userId={profile.id} maxDisplay={6} />
            </div>

            {/* Languages */}
            {languages.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Languages className="w-4 h-4 text-slate-500" />
                {languages.map((lang) => (
                  <Badge key={lang.language} variant="outline" className="text-xs">
                    {lang.language}
                    <span className="ml-1 text-slate-500">({lang.level})</span>
                  </Badge>
                ))}
                {isOwnProfile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setIsEditingLanguages(true)}
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            )}

            {/* Social Links */}
            {(socialLinks.instagram ||
              socialLinks.twitter ||
              socialLinks.linkedin ||
              socialLinks.youtube ||
              socialLinks.website) && (
              <div className="flex items-center gap-3">
                {socialLinks.website && (
                  <a
                    href={socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-primary transition-colors"
                  >
                    <Globe className="w-5 h-5" />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a
                    href={`https://instagram.com/${socialLinks.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-pink-600 transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a
                    href={`https://twitter.com/${socialLinks.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-blue-400 transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {socialLinks.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${socialLinks.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-blue-700 transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {socialLinks.youtube && (
                  <a
                    href={`https://youtube.com/${socialLinks.youtube}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-red-600 transition-colors"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
                {isOwnProfile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setIsEditingSocial(true)}
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            )}

            {/* Empty state prompts for own profile */}
            {isOwnProfile && (
              <div className="flex flex-wrap gap-2">
                {!profile.headline && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingBio(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Headline
                  </Button>
                )}
                {languages.length === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingLanguages(true)}
                  >
                    <Languages className="w-4 h-4 mr-1" />
                    Add Languages
                  </Button>
                )}
                {!socialLinks.instagram && !socialLinks.website && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingSocial(true)}
                  >
                    <Link2 className="w-4 h-4 mr-1" />
                    Add Social Links
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Bio Modal */}
      <Dialog open={isEditingBio} onOpenChange={setIsEditingBio}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="headline">
                Professional Headline
                <span className="text-slate-500 ml-1 text-xs">(100 chars max)</span>
              </Label>
              <Input
                id="headline"
                value={editForm.headline}
                onChange={(e) =>
                  setEditForm({ ...editForm, headline: e.target.value })
                }
                placeholder="e.g., Award-winning Wedding DJ | 200+ Events"
                maxLength={100}
              />
              <p className="text-xs text-slate-500">
                A concise description of what you do
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">
                Tagline
                <span className="text-slate-500 ml-1 text-xs">(250 chars max)</span>
              </Label>
              <Textarea
                id="tagline"
                value={editForm.tagline}
                onChange={(e) =>
                  setEditForm({ ...editForm, tagline: e.target.value })
                }
                placeholder="A quick elevator pitch about your services..."
                maxLength={250}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">About</Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm({ ...editForm, bio: e.target.value })
                }
                placeholder="Tell clients about your experience, style, and what makes you unique..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Select
                value={String(editForm.years_experience)}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, years_experience: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30].map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y === 0 ? 'Less than 1 year' : `${y}+ years`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingBio(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBio} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Languages Modal */}
      <Dialog open={isEditingLanguages} onOpenChange={setIsEditingLanguages}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Languages</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Current languages */}
            {languages.length > 0 && (
              <div className="space-y-2">
                {languages.map((lang) => (
                  <div
                    key={lang.language}
                    className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded"
                  >
                    <span className="font-medium">{lang.language}</span>
                    <div className="flex items-center gap-2">
                      <Select
                        value={lang.level}
                        onValueChange={(value) =>
                          updateLanguageLevel(lang.language, value)
                        }
                      >
                        <SelectTrigger className="w-36 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGE_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeLanguage(lang.language)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add language */}
            <div className="space-y-2">
              <Label>Add Language</Label>
              <div className="flex flex-wrap gap-2">
                {COMMON_LANGUAGES.filter(
                  (l) => !languages.find((lang) => lang.language === l)
                ).map((lang) => (
                  <Badge
                    key={lang}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => addLanguage(lang)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingLanguages(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLanguages} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Social Links Modal */}
      <Dialog open={isEditingSocial} onOpenChange={setIsEditingSocial}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Social Links</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Website
              </Label>
              <Input
                value={socialLinks.website || ''}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, website: e.target.value })
                }
                placeholder="https://yourwebsite.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                Instagram
              </Label>
              <Input
                value={socialLinks.instagram || ''}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, instagram: e.target.value })
                }
                placeholder="username (without @)"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Twitter className="w-4 h-4" />
                Twitter/X
              </Label>
              <Input
                value={socialLinks.twitter || ''}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, twitter: e.target.value })
                }
                placeholder="username (without @)"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </Label>
              <Input
                value={socialLinks.linkedin || ''}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, linkedin: e.target.value })
                }
                placeholder="username or profile URL"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Youtube className="w-4 h-4" />
                YouTube
              </Label>
              <Input
                value={socialLinks.youtube || ''}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, youtube: e.target.value })
                }
                placeholder="channel name or @handle"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingSocial(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSocial} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Badge Modal */}
      <BadgeModal
        isOpen={showBadgeModal}
        onClose={() => setShowBadgeModal(false)}
        userId={profile.id}
      />
    </>
  )
}

export default EnhancedProfileHeader
