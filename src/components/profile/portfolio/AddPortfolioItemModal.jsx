/**
 * Add Portfolio Item Modal
 *
 * Modal for creating/editing portfolio items with media upload
 * Supports images, videos, audio, links, and before/after comparisons
 *
 * Sources:
 * - https://help.fiverr.com/hc/en-us/articles/4413134063633-Using-My-Portfolio
 * - https://www.pixpa.com/online-portfolio/musicians-website
 */

import React, { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Image,
  Video,
  Music,
  Link2,
  ArrowLeftRight,
  Upload,
  X,
  Plus,
  Loader2,
  Youtube,
  CheckCircle,
} from 'lucide-react'
import { createPortfolioItem, updatePortfolioItem, parseExternalUrl } from '../../../api/portfolio'
import { supabase } from '../../../lib/supabase'

const MEDIA_TYPES = [
  { id: 'image', label: 'Image', icon: Image, description: 'Photos, graphics, designs' },
  { id: 'video', label: 'Video', icon: Video, description: 'YouTube, Vimeo, or upload' },
  { id: 'audio', label: 'Audio', icon: Music, description: 'SoundCloud, Spotify, or upload' },
  { id: 'link', label: 'Link', icon: Link2, description: 'External website or project' },
  { id: 'before_after', label: 'Before/After', icon: ArrowLeftRight, description: 'Comparison images' },
]

const AddPortfolioItemModal = ({
  isOpen,
  onClose,
  userId,
  editItem = null,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedType, setSelectedType] = useState(editItem?.type || 'image')
  const [formData, setFormData] = useState({
    title: editItem?.title || '',
    description: editItem?.description || '',
    external_url: editItem?.external_url || '',
    skills_used: editItem?.skills_used || [],
    tags: editItem?.tags || [],
  })
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(editItem?.media_url || null)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(editItem?.thumbnail_url || null)
  const [beforeFile, setBeforeFile] = useState(null)
  const [beforePreview, setBeforePreview] = useState(editItem?.before_image_url || null)
  const [afterFile, setAfterFile] = useState(null)
  const [afterPreview, setAfterPreview] = useState(editItem?.after_image_url || null)
  const [newSkill, setNewSkill] = useState('')
  const [detectedPlatform, setDetectedPlatform] = useState(editItem?.external_platform || null)

  const fileInputRef = useRef(null)
  const thumbnailInputRef = useRef(null)
  const beforeInputRef = useRef(null)
  const afterInputRef = useRef(null)

  const isEditing = !!editItem

  // Handle file selection
  const handleFileSelect = (e, type = 'media') => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      if (type === 'media') {
        setMediaFile(file)
        setMediaPreview(reader.result)
      } else if (type === 'thumbnail') {
        setThumbnailFile(file)
        setThumbnailPreview(reader.result)
      } else if (type === 'before') {
        setBeforeFile(file)
        setBeforePreview(reader.result)
      } else if (type === 'after') {
        setAfterFile(file)
        setAfterPreview(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  // Handle URL input and detect platform
  const handleUrlChange = (url) => {
    setFormData({ ...formData, external_url: url })
    const parsed = parseExternalUrl(url)
    setDetectedPlatform(parsed?.platform || null)
  }

  // Add skill
  const addSkill = () => {
    if (newSkill.trim() && !formData.skills_used.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills_used: [...formData.skills_used, newSkill.trim()],
      })
      setNewSkill('')
    }
  }

  // Remove skill
  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      skills_used: formData.skills_used.filter((s) => s !== skill),
    })
  }

  // Upload file to Supabase Storage
  const uploadFile = async (file, folder = 'portfolio') => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(filePath, file)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath)

    return publicUrl
  }

  // Handle submit
  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a title')
      return
    }

    setIsSubmitting(true)
    try {
      let mediaUrl = editItem?.media_url || null
      let thumbnailUrl = editItem?.thumbnail_url || null
      let beforeImageUrl = editItem?.before_image_url || null
      let afterImageUrl = editItem?.after_image_url || null

      // Upload files if selected
      if (mediaFile) {
        mediaUrl = await uploadFile(mediaFile, 'portfolio')
      }
      if (thumbnailFile) {
        thumbnailUrl = await uploadFile(thumbnailFile, 'thumbnails')
      }
      if (beforeFile) {
        beforeImageUrl = await uploadFile(beforeFile, 'portfolio')
      }
      if (afterFile) {
        afterImageUrl = await uploadFile(afterFile, 'portfolio')
      }

      const portfolioData = {
        type: selectedType,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        media_url: mediaUrl,
        thumbnail_url: thumbnailUrl,
        external_url: formData.external_url.trim() || null,
        external_platform: detectedPlatform,
        before_image_url: beforeImageUrl,
        after_image_url: afterImageUrl,
        skills_used: formData.skills_used,
        tags: formData.tags,
      }

      if (isEditing) {
        await updatePortfolioItem(editItem.id, portfolioData)
      } else {
        await createPortfolioItem(userId, portfolioData)
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to save portfolio item:', error)
      alert('Failed to save. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
          </DialogTitle>
          <DialogDescription>
            Showcase your work to attract clients. High-quality portfolio items
            increase your chances of getting booked.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Media Type Selection */}
          {!isEditing && (
            <div className="space-y-3">
              <Label>What type of content?</Label>
              <div className="grid grid-cols-5 gap-2">
                {MEDIA_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                      selectedType === type.id
                        ? 'border-primary bg-primary/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                    }`}
                  >
                    <type.icon
                      className={`w-6 h-6 mb-1 ${
                        selectedType === type.id ? 'text-primary' : 'text-slate-500'
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        selectedType === type.id ? 'text-primary' : 'text-slate-600'
                      }`}
                    >
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Wedding DJ Set at Sydney Opera House"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Tell the story behind this work..."
              rows={3}
            />
          </div>

          {/* Media Upload - Based on Type */}
          {selectedType === 'image' && (
            <div className="space-y-2">
              <Label>Image</Label>
              <div
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {mediaPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="max-h-48 rounded-lg"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        setMediaFile(null)
                        setMediaPreview(null)
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, 'media')}
              />
            </div>
          )}

          {selectedType === 'video' && (
            <Tabs defaultValue="url" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url">YouTube/Vimeo URL</TabsTrigger>
                <TabsTrigger value="upload">Upload Video</TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="space-y-4">
                <div className="space-y-2">
                  <Label>Video URL</Label>
                  <div className="relative">
                    <Input
                      value={formData.external_url}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                    {detectedPlatform && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {detectedPlatform}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Paste a YouTube or Vimeo URL
                  </p>
                </div>

                {/* Custom Thumbnail */}
                <div className="space-y-2">
                  <Label>Custom Thumbnail (optional)</Label>
                  <div
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => thumbnailInputRef.current?.click()}
                  >
                    {thumbnailPreview ? (
                      <div className="relative inline-block">
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail"
                          className="max-h-24 rounded"
                        />
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            setThumbnailFile(null)
                            setThumbnailPreview(null)
                          }}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">
                        <Image className="w-6 h-6 inline mr-2" />
                        Add custom thumbnail
                      </p>
                    )}
                  </div>
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, 'thumbnail')}
                  />
                </div>
              </TabsContent>
              <TabsContent value="upload" className="space-y-2">
                <div
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Video className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Upload video file
                  </p>
                  <p className="text-xs text-slate-500 mt-1">MP4, WebM up to 100MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'media')}
                />
              </TabsContent>
            </Tabs>
          )}

          {selectedType === 'audio' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Audio URL (SoundCloud or Spotify)</Label>
                <div className="relative">
                  <Input
                    value={formData.external_url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://soundcloud.com/... or https://open.spotify.com/..."
                  />
                  {detectedPlatform && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {detectedPlatform}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Image for Audio */}
              <div className="space-y-2">
                <Label>Cover Image</Label>
                <div
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => thumbnailInputRef.current?.click()}
                >
                  {thumbnailPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={thumbnailPreview}
                        alt="Cover"
                        className="max-h-32 rounded"
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          setThumbnailFile(null)
                          setThumbnailPreview(null)
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Music className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Add cover image</p>
                    </>
                  )}
                </div>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'thumbnail')}
                />
              </div>
            </div>
          )}

          {selectedType === 'link' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>External URL *</Label>
                <Input
                  value={formData.external_url}
                  onChange={(e) =>
                    setFormData({ ...formData, external_url: e.target.value })
                  }
                  placeholder="https://your-project.com"
                />
              </div>

              {/* Preview Image */}
              <div className="space-y-2">
                <Label>Preview Image</Label>
                <div
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => thumbnailInputRef.current?.click()}
                >
                  {thumbnailPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={thumbnailPreview}
                        alt="Preview"
                        className="max-h-32 rounded"
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          setThumbnailFile(null)
                          setThumbnailPreview(null)
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Link2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">
                        Add screenshot or preview
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'thumbnail')}
                />
              </div>
            </div>
          )}

          {selectedType === 'before_after' && (
            <div className="grid grid-cols-2 gap-4">
              {/* Before Image */}
              <div className="space-y-2">
                <Label>Before Image</Label>
                <div
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors aspect-square flex items-center justify-center"
                  onClick={() => beforeInputRef.current?.click()}
                >
                  {beforePreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={beforePreview}
                        alt="Before"
                        className="w-full h-full object-cover rounded"
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          setBeforeFile(null)
                          setBeforePreview(null)
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
                        Before
                      </span>
                    </div>
                  ) : (
                    <div>
                      <Image className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Before</p>
                    </div>
                  )}
                </div>
                <input
                  ref={beforeInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'before')}
                />
              </div>

              {/* After Image */}
              <div className="space-y-2">
                <Label>After Image</Label>
                <div
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors aspect-square flex items-center justify-center"
                  onClick={() => afterInputRef.current?.click()}
                >
                  {afterPreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={afterPreview}
                        alt="After"
                        className="w-full h-full object-cover rounded"
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          setAfterFile(null)
                          setAfterPreview(null)
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-2 right-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
                        After
                      </span>
                    </div>
                  ) : (
                    <div>
                      <Image className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">After</p>
                    </div>
                  )}
                </div>
                <input
                  ref={afterInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'after')}
                />
              </div>
            </div>
          )}

          {/* Skills Used */}
          <div className="space-y-2">
            <Label>Skills Used</Label>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSkill()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addSkill}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.skills_used.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills_used.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100"
                    onClick={() => removeSkill(skill)}
                  >
                    {skill}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditing ? 'Saving...' : 'Adding...'}
              </>
            ) : isEditing ? (
              'Save Changes'
            ) : (
              'Add to Portfolio'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddPortfolioItemModal
