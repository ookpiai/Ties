/**
 * Create Page - Portfolio Studio
 *
 * A creative workspace for building and managing your portfolio.
 * Inspired by Dribbble/Behance project creation experiences.
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Palette,
  Plus,
  Image,
  Video,
  Music,
  Link as LinkIcon,
  Layers,
  Sparkles,
  FolderPlus,
  Eye,
  Grid3X3,
  List,
  Star,
  Clock,
  ArrowRight,
  Camera,
  Film,
  Mic,
  ExternalLink,
  SplitSquareVertical
} from 'lucide-react'
import { useAuth } from '../../App'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PortfolioGallery, AddPortfolioItemModal } from '../profile/portfolio'
import { getPortfolioItems } from '../../api/portfolio'

const CreatePage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [portfolio, setPortfolio] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [selectedType, setSelectedType] = useState(null)
  const [viewMode, setViewMode] = useState('grid')

  // Load portfolio items
  useEffect(() => {
    loadPortfolio()
  }, [user?.id])

  const loadPortfolio = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const data = await getPortfolioItems(user.id)
      setPortfolio(data || [])
    } catch (error) {
      console.error('Failed to load portfolio:', error)
    }
    setLoading(false)
  }

  // Portfolio item types with creative descriptions
  const portfolioTypes = [
    {
      type: 'image',
      title: 'Photo',
      description: 'Upload photos of your work, events, or projects',
      icon: Camera,
      color: 'bg-gradient-to-br from-pink-500 to-rose-500',
      lightColor: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800',
      examples: ['Event photos', 'Product shots', 'Behind the scenes']
    },
    {
      type: 'video',
      title: 'Video',
      description: 'Showcase video content or performances',
      icon: Film,
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      lightColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      examples: ['Demo reels', 'Performance clips', 'Tutorials']
    },
    {
      type: 'audio',
      title: 'Audio',
      description: 'Share music, podcasts, or audio samples',
      icon: Mic,
      color: 'bg-gradient-to-br from-purple-500 to-violet-500',
      lightColor: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
      examples: ['Music tracks', 'Voice samples', 'Podcast episodes']
    },
    {
      type: 'link',
      title: 'External Link',
      description: 'Link to external projects, websites, or profiles',
      icon: ExternalLink,
      color: 'bg-gradient-to-br from-emerald-500 to-teal-500',
      lightColor: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
      examples: ['Website', 'YouTube channel', 'Press coverage']
    },
    {
      type: 'before_after',
      title: 'Before & After',
      description: 'Show transformation or comparison work',
      icon: SplitSquareVertical,
      color: 'bg-gradient-to-br from-orange-500 to-amber-500',
      lightColor: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
      examples: ['Makeovers', 'Renovations', 'Editing comparisons']
    }
  ]

  const handleAddItem = (type = null) => {
    setSelectedType(type)
    setEditingItem(null)
    setShowAddModal(true)
  }

  const handleEditItem = (item) => {
    setSelectedType(item.item_type)
    setEditingItem(item)
    setShowAddModal(true)
  }

  const handleModalClose = () => {
    setShowAddModal(false)
    setSelectedType(null)
    setEditingItem(null)
  }

  const handleSuccess = () => {
    handleModalClose()
    loadPortfolio()
  }

  // Stats
  const stats = {
    total: portfolio.length,
    featured: portfolio.filter(p => p.is_featured).length,
    byType: portfolioTypes.reduce((acc, type) => {
      acc[type.type] = portfolio.filter(p => p.item_type === type.type).length
      return acc
    }, {})
  }

  return (
    <div className="min-h-screen bg-app dark:bg-[#0B0B0B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E03131] to-[#FF6B6B] flex items-center justify-center shadow-lg">
              <Palette className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Portfolio Studio
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Create and curate your professional portfolio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/profile')}
              className="hidden sm:flex"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Public Profile
            </Button>
            <Button onClick={() => handleAddItem()}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Item
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                  <Grid3X3 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Items</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stats.featured}</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-500">Featured</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-pink-200 dark:border-pink-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-pink-700 dark:text-pink-400">{stats.byType['image'] || 0}</p>
                  <p className="text-xs text-pink-600 dark:text-pink-500">Photos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center">
                  <Film className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.byType['video'] || 0}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-500">Videos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Add Section */}
        <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-[#E03131]" />
              Quick Add
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {portfolioTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.type}
                    onClick={() => handleAddItem(type.type)}
                    className={`${type.lightColor} border-2 rounded-xl p-4 text-left transition-all hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#E03131] group`}
                  >
                    <div className={`w-12 h-12 ${type.color} rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {type.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {type.description}
                    </p>
                    {stats.byType[type.type] > 0 && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {stats.byType[type.type]} item{stats.byType[type.type] !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Create a New Job Link */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                  <FolderPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Looking to hire?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create a job posting to find freelancers, venues, or vendors for your event
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/jobs/create')}
                className="hidden sm:flex"
              >
                Create Job
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/jobs/create')}
              className="w-full mt-4 sm:hidden"
            >
              Create Job
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Portfolio Gallery */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Your Portfolio
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click any item to edit or manage
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="w-9 h-8 p-0"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="w-9 h-8 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E03131] mx-auto"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading your portfolio...</p>
            </div>
          ) : portfolio.length === 0 ? (
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                  <Layers className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Your portfolio is empty
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Start showcasing your work! Add photos, videos, audio, or links to build your professional portfolio.
                </p>
                <Button onClick={() => handleAddItem()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <PortfolioGallery
              userId={user?.id}
              items={portfolio}
              isOwner={true}
              onRefresh={loadPortfolio}
              onAddItem={() => handleAddItem()}
              onEditItem={handleEditItem}
            />
          )}
        </div>

        {/* Tips Section */}
        <Card className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
          <CardContent className="p-5">
            <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Portfolio Tips
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-amber-800 dark:text-amber-400">
              <div className="flex items-start gap-2">
                <Star className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Feature your best work to highlight it on your profile</span>
              </div>
              <div className="flex items-start gap-2">
                <Image className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>High-quality images make a stronger first impression</span>
              </div>
              <div className="flex items-start gap-2">
                <Layers className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Add variety - mix photos, videos, and other content</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Portfolio Item Modal */}
      <AddPortfolioItemModal
        isOpen={showAddModal}
        onClose={handleModalClose}
        userId={user?.id}
        editItem={editingItem}
        defaultType={selectedType}
        onSuccess={handleSuccess}
      />
    </div>
  )
}

export default CreatePage
