/**
 * Portfolio Gallery Component - Premium SaaS Edition
 *
 * Modern styling with glassmorphism, gradients, and micro-interactions
 * Inspired by Fiverr Portfolio, Dribbble shots, and modern SaaS design
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Image,
  Video,
  Music,
  Link2,
  Play,
  Eye,
  Star,
  Plus,
  GripVertical,
  Trash2,
  Edit2,
  ExternalLink,
  X,
  Loader2,
  ArrowLeftRight,
  Sparkles,
} from 'lucide-react'
import {
  getPortfolioItems,
  deletePortfolioItem,
  toggleFeatured,
  reorderPortfolioItems,
  getEmbedUrl,
} from '../../../api/portfolio'

// Media type icons and colors with gradient themes
const MEDIA_TYPE_CONFIG = {
  image: {
    icon: Image,
    label: 'Image',
    gradient: 'from-blue-500 to-cyan-400',
    bgGradient: 'from-blue-500/10 to-cyan-400/10',
    borderColor: 'border-blue-500/20',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  video: {
    icon: Video,
    label: 'Video',
    gradient: 'from-red-500 to-pink-500',
    bgGradient: 'from-red-500/10 to-pink-500/10',
    borderColor: 'border-red-500/20',
    textColor: 'text-red-600 dark:text-red-400',
  },
  audio: {
    icon: Music,
    label: 'Audio',
    gradient: 'from-purple-500 to-violet-500',
    bgGradient: 'from-purple-500/10 to-violet-500/10',
    borderColor: 'border-purple-500/20',
    textColor: 'text-purple-600 dark:text-purple-400',
  },
  link: {
    icon: Link2,
    label: 'Link',
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-500/10 to-emerald-500/10',
    borderColor: 'border-green-500/20',
    textColor: 'text-green-600 dark:text-green-400',
  },
  before_after: {
    icon: ArrowLeftRight,
    label: 'Before/After',
    gradient: 'from-orange-500 to-amber-500',
    bgGradient: 'from-orange-500/10 to-amber-500/10',
    borderColor: 'border-orange-500/20',
    textColor: 'text-orange-600 dark:text-orange-400',
  },
}

const PortfolioGallery = ({
  userId,
  items: propItems,
  isOwner = false,
  onAddItem,
  onEditItem,
  onRefresh,
  maxDisplay = 12,
  compact = false,
}) => {
  const [items, setItems] = useState(propItems || [])
  const [isLoading, setIsLoading] = useState(!propItems)
  const [selectedItem, setSelectedItem] = useState(null)

  // Load portfolio items if not provided
  useEffect(() => {
    if (propItems) {
      setItems(propItems)
      return
    }

    const loadItems = async () => {
      if (!userId) return
      setIsLoading(true)
      try {
        const data = await getPortfolioItems(userId)
        setItems(data)
      } catch (error) {
        console.error('Failed to load portfolio:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadItems()
  }, [userId, propItems])

  // Handle delete
  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) return
    try {
      await deletePortfolioItem(itemId)
      setItems(items.filter((item) => item.id !== itemId))
      onRefresh?.()
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  // Handle toggle featured
  const handleToggleFeatured = async (itemId, currentState) => {
    try {
      await toggleFeatured(itemId, !currentState)
      setItems(
        items.map((item) =>
          item.id === itemId ? { ...item, is_featured: !currentState } : item
        )
      )
    } catch (error) {
      console.error('Failed to toggle featured:', error)
    }
  }

  // Render media preview based on type
  const renderMediaPreview = (item) => {
    const TypeIcon = MEDIA_TYPE_CONFIG[item.type]?.icon || Image

    if (item.thumbnail_url) {
      return (
        <img
          src={item.thumbnail_url}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      )
    }

    if (item.type === 'image' && item.media_url) {
      return (
        <img
          src={item.media_url}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      )
    }

    if (item.type === 'video' && item.external_platform === 'youtube') {
      const videoId = item.external_url?.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      )?.[1]
      if (videoId) {
        return (
          <div className="relative w-full h-full">
            <img
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg shadow-red-500/30 transform transition-transform group-hover:scale-110">
                <Play className="w-6 h-6 text-white ml-1" />
              </div>
            </div>
          </div>
        )
      }
    }

    if (item.type === 'before_after' && item.before_image_url && item.after_image_url) {
      return (
        <div className="w-full h-full flex">
          <div className="w-1/2 h-full relative overflow-hidden">
            <img
              src={item.before_image_url}
              alt="Before"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-2 left-2 text-xs bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full font-medium">
              Before
            </span>
          </div>
          <div className="w-1/2 h-full relative overflow-hidden border-l-2 border-white/50">
            <img
              src={item.after_image_url}
              alt="After"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-2 right-2 text-xs bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full font-medium">
              After
            </span>
          </div>
        </div>
      )
    }

    // Default placeholder with gradient
    const config = MEDIA_TYPE_CONFIG[item.type] || MEDIA_TYPE_CONFIG.image
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${config.bgGradient}`}>
        <TypeIcon className={`w-12 h-12 ${config.textColor}`} />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <Sparkles className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    )
  }

  if (items.length === 0 && !isOwner) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
          <Image className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          No Portfolio Items
        </h3>
        <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
          This user hasn't added any portfolio items yet.
        </p>
      </div>
    )
  }

  const gridClass = compact
    ? 'grid-cols-2 gap-3'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'

  return (
    <div className="space-y-6">
      {/* Portfolio Grid - Masonry-like layout with premium styling */}
      <div className={`grid ${gridClass}`}>
        {items.slice(0, maxDisplay).map((item, index) => {
          const config = MEDIA_TYPE_CONFIG[item.type] || MEDIA_TYPE_CONFIG.image

          return (
            <div
              key={item.id}
              className="group relative"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Card with glassmorphism effect */}
              <div
                className={`
                  relative overflow-hidden rounded-2xl
                  bg-white dark:bg-slate-900/80
                  backdrop-blur-xl
                  border border-slate-200/80 dark:border-slate-700/50
                  shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/20
                  transition-all duration-500 ease-out
                  cursor-pointer
                  hover:-translate-y-1
                  ${item.is_featured ? 'ring-2 ring-yellow-500/50' : ''}
                `}
                onClick={() => setSelectedItem(item)}
              >
                {/* Media Preview */}
                <div className={`relative overflow-hidden ${compact ? 'aspect-square' : 'aspect-video'}`}>
                  {renderMediaPreview(item)}

                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* View button on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <Button
                      size="sm"
                      className="bg-white/90 backdrop-blur-sm text-slate-900 hover:bg-white shadow-lg"
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      View
                    </Button>
                  </div>

                  {/* Featured Badge with glow */}
                  {item.is_featured && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0 shadow-lg shadow-yellow-500/30">
                        <Star className="w-3 h-3 mr-1 fill-white" />
                        Featured
                      </Badge>
                    </div>
                  )}

                  {/* Type Badge with gradient */}
                  <div className="absolute top-3 right-3">
                    <Badge
                      className={`
                        bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm
                        border ${config.borderColor}
                        ${config.textColor}
                        shadow-sm
                      `}
                    >
                      {React.createElement(config.icon, { className: 'w-3 h-3 mr-1' })}
                      {config.label}
                    </Badge>
                  </div>

                  {/* Owner Actions */}
                  {isOwner && (
                    <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="w-8 h-8 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleFeatured(item.id, item.is_featured)
                        }}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            item.is_featured ? 'fill-yellow-500 text-yellow-500' : 'text-slate-600'
                          }`}
                        />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="w-8 h-8 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditItem?.(item)
                        }}
                      >
                        <Edit2 className="w-4 h-4 text-slate-600" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="w-8 h-8 bg-white/90 backdrop-blur-sm hover:bg-red-50 hover:text-red-600 shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(item.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Content with subtle gradient */}
                {!compact && (
                  <CardContent className="p-4 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-slate-800/30">
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {/* Skills/Tags with pill design */}
                    {item.skills_used && item.skills_used.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {item.skills_used.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {item.skills_used.length > 3 && (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                            +{item.skills_used.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* View Count with icon */}
                    {item.view_count > 0 && (
                      <div className="flex items-center text-xs text-slate-500 dark:text-slate-500 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        {item.view_count.toLocaleString()} views
                      </div>
                    )}
                  </CardContent>
                )}
              </div>
            </div>
          )
        })}

        {/* Add Item Card with premium dashed border */}
        {isOwner && items.length < maxDisplay && !compact && (
          <div
            className="group flex items-center justify-center aspect-video rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1"
            onClick={onAddItem}
          >
            <div className="w-full h-full rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all duration-300">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Plus className="w-6 h-6 text-slate-500 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">
                  Add Portfolio Item
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Show More Button with gradient */}
      {items.length > maxDisplay && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
          >
            View All {items.length} Items
          </Button>
        </div>
      )}

      {/* Premium Lightbox Modal */}
      {selectedItem && (
        <PortfolioLightbox
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onPrev={() => {
            const currentIndex = items.findIndex((i) => i.id === selectedItem.id)
            if (currentIndex > 0) setSelectedItem(items[currentIndex - 1])
          }}
          onNext={() => {
            const currentIndex = items.findIndex((i) => i.id === selectedItem.id)
            if (currentIndex < items.length - 1) setSelectedItem(items[currentIndex + 1])
          }}
        />
      )}
    </div>
  )
}

/**
 * Premium Lightbox Modal with glassmorphism
 */
const PortfolioLightbox = ({ item, onClose, onPrev, onNext }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose, onPrev, onNext])

  const renderContent = () => {
    if (item.type === 'image' && item.media_url) {
      return (
        <img
          src={item.media_url}
          alt={item.title}
          className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl"
        />
      )
    }

    if (item.type === 'video' && item.external_url) {
      const embedUrl = getEmbedUrl(item.external_platform, item.external_url)
      return (
        <iframe
          src={embedUrl}
          className="w-full aspect-video max-w-4xl rounded-2xl shadow-2xl"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      )
    }

    if (item.type === 'audio' && item.external_url) {
      if (item.external_platform === 'spotify') {
        return (
          <iframe
            src={getEmbedUrl('spotify', item.external_url)}
            className="w-full max-w-md h-80 rounded-2xl shadow-2xl"
            allow="encrypted-media"
          />
        )
      }
      if (item.external_platform === 'soundcloud') {
        return (
          <iframe
            src={getEmbedUrl('soundcloud', item.external_url)}
            className="w-full max-w-xl h-40 rounded-2xl shadow-2xl"
          />
        )
      }
    }

    if (item.type === 'before_after') {
      return (
        <div className="flex gap-6 max-w-5xl">
          <div className="flex-1">
            <p className="text-sm text-white/60 mb-3 font-medium">Before</p>
            <img
              src={item.before_image_url}
              alt="Before"
              className="w-full rounded-2xl shadow-2xl"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm text-white/60 mb-3 font-medium">After</p>
            <img
              src={item.after_image_url}
              alt="After"
              className="w-full rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )
    }

    if (item.type === 'link' && item.external_url) {
      return (
        <div className="text-center p-10 bg-white/10 backdrop-blur-xl rounded-3xl max-w-md border border-white/20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
            <Link2 className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
          {item.description && (
            <p className="text-white/60 mb-6">{item.description}</p>
          )}
          <Button
            className="bg-white text-slate-900 hover:bg-white/90"
            asChild
          >
            <a href={item.external_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Link
            </a>
          </Button>
        </div>
      )
    }

    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/10"
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </Button>

      {/* Content */}
      <div
        className="relative z-10 max-w-6xl w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {renderContent()}

        {/* Info Panel with glassmorphism */}
        <div className="mt-8 text-center text-white max-w-2xl px-4">
          <h3 className="text-2xl font-bold">{item.title}</h3>
          {item.description && (
            <p className="text-white/60 mt-3 leading-relaxed">{item.description}</p>
          )}

          {/* Skills */}
          {item.skills_used && item.skills_used.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {item.skills_used.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-sm font-medium border border-white/10"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* External Link */}
          {item.external_url && item.type !== 'link' && (
            <div className="mt-6">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                asChild
              >
                <a href={item.external_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Original
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows with glassmorphism */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/10"
        onClick={(e) => {
          e.stopPropagation()
          onPrev()
        }}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/10"
        onClick={(e) => {
          e.stopPropagation()
          onNext()
        }}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  )
}

export default PortfolioGallery
