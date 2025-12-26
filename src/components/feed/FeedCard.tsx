import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import {
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  MapPin,
  Share2,
  Flag,
  EyeOff,
  UserPlus,
  UserMinus,
  ExternalLink
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { FeedItem } from '@/api/feed'
import { likeFeedItem, unlikeFeedItem, saveFeedItem, unsaveFeedItem, hideFeedItem, followUser, unfollowUser } from '@/api/feed'

interface FeedCardProps {
  item: FeedItem
  onInteraction?: () => void
  onHide?: () => void
  isFollowing?: boolean
  currentUserId?: string
}

export default function FeedCard({
  item,
  onInteraction,
  onHide,
  isFollowing = false,
  currentUserId
}: FeedCardProps) {
  const [liked, setLiked] = useState(item.has_liked)
  const [saved, setSaved] = useState(item.has_saved)
  const [likeCount, setLikeCount] = useState(item.like_count)
  const [following, setFollowing] = useState(isFollowing)
  const [showComments, setShowComments] = useState(false)

  const isOwnPost = currentUserId === item.actor_id

  const handleLike = async () => {
    try {
      if (liked) {
        await unlikeFeedItem(item.id)
        setLikeCount(prev => Math.max(0, prev - 1))
      } else {
        await likeFeedItem(item.id)
        setLikeCount(prev => prev + 1)
      }
      setLiked(!liked)
      onInteraction?.()
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleSave = async () => {
    try {
      if (saved) {
        await unsaveFeedItem(item.id)
      } else {
        await saveFeedItem(item.id)
      }
      setSaved(!saved)
      onInteraction?.()
    } catch (error) {
      console.error('Error toggling save:', error)
    }
  }

  const handleHide = async () => {
    try {
      await hideFeedItem(item.id)
      onHide?.()
    } catch (error) {
      console.error('Error hiding item:', error)
    }
  }

  const handleFollow = async () => {
    try {
      if (following) {
        await unfollowUser(item.actor_id)
      } else {
        await followUser(item.actor_id)
      }
      setFollowing(!following)
      onInteraction?.()
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  const getItemTypeLabel = () => {
    switch (item.item_type) {
      case 'portfolio_update': return 'New Work'
      case 'job_posted': return 'Job'
      case 'event_posted': return 'Event'
      case 'gig_completed': return 'Completed Gig'
      case 'review_posted': return 'Review'
      case 'profile_joined': return 'New Member'
      case 'availability_opened': return 'Available'
      default: return 'Update'
    }
  }

  const getItemTypeColor = () => {
    switch (item.item_type) {
      case 'portfolio_update': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
      case 'job_posted': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      case 'event_posted': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
      case 'gig_completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'review_posted': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'profile_joined': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
      case 'availability_opened': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
    }
  }

  const getRelatedLink = () => {
    if (!item.related_id || !item.related_type) return null
    switch (item.related_type) {
      case 'job_posting': return `/jobs/${item.related_id}`
      case 'booking': return `/bookings/${item.related_id}`
      case 'profile': return `/profile/${item.related_id}`
      default: return null
    }
  }

  const relatedLink = getRelatedLink()
  const timeAgo = formatDistanceToNow(new Date(item.created_at), { addSuffix: true })

  return (
    <div className="bg-surface border border-app rounded-xl p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Link to={`/profile/${item.actor_id}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={item.actor_avatar_url || undefined} />
              <AvatarFallback>
                {item.actor_display_name?.charAt(0)?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <Link
                to={`/profile/${item.actor_id}`}
                className="font-semibold text-slate-900 dark:text-white hover:underline"
              >
                {item.actor_display_name}
              </Link>
              {item.actor_verified && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  Verified
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{item.actor_role}</span>
              <span>·</span>
              <span>{timeAgo}</span>
              {item.city && (
                <>
                  <span>·</span>
                  <span className="flex items-center">
                    <MapPin className="w-3 h-3 mr-0.5" />
                    {item.city}
                    {item.distance_km !== null && (
                      <span className="ml-1">({Math.round(item.distance_km)}km)</span>
                    )}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className={`text-xs ${getItemTypeColor()}`}>
            {getItemTypeLabel()}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isOwnPost && (
                <>
                  <DropdownMenuItem onClick={handleFollow}>
                    {following ? (
                      <>
                        <UserMinus className="mr-2 h-4 w-4" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Follow
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleHide}>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide this post
              </DropdownMenuItem>
              {!isOwnPost && (
                <DropdownMenuItem className="text-red-600">
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        <h3 className="font-medium text-slate-900 dark:text-white mb-1">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
            {item.description}
          </p>
        )}
      </div>

      {/* Images */}
      {item.image_urls && item.image_urls.length > 0 && (
        <div className={`mb-3 grid gap-2 ${
          item.image_urls.length === 1 ? 'grid-cols-1' :
          item.image_urls.length === 2 ? 'grid-cols-2' :
          'grid-cols-3'
        }`}>
          {item.image_urls.slice(0, 3).map((url, idx) => (
            <div
              key={idx}
              className="relative aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden"
            >
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover"
              />
              {idx === 2 && item.image_urls.length > 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    +{item.image_urls.length - 3}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Metadata (for jobs, events, etc.) */}
      {item.metadata && Object.keys(item.metadata).length > 0 && (
        <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          {item.item_type === 'job_posted' && item.metadata.budget && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Budget</span>
              <span className="font-medium text-slate-900 dark:text-white">
                ${item.metadata.budget}
              </span>
            </div>
          )}
          {item.item_type === 'gig_completed' && item.metadata.amount && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Earned</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                ${item.metadata.amount}
              </span>
            </div>
          )}
          {item.metadata.rating && (
            <div className="flex items-center space-x-1 text-sm">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={i < item.metadata.rating ? 'text-yellow-400' : 'text-slate-300'}
                >
                  ★
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View Details Link */}
      {relatedLink && (
        <Link
          to={relatedLink}
          className="inline-flex items-center text-sm text-primary hover:underline mb-3"
        >
          View details
          <ExternalLink className="ml-1 h-3 w-3" />
        </Link>
      )}

      {/* Interactions */}
      <div className="flex items-center justify-between pt-3 border-t border-app">
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`h-8 px-2 ${liked ? 'text-red-500' : 'text-slate-500'}`}
          >
            <Heart className={`h-4 w-4 mr-1 ${liked ? 'fill-current' : ''}`} />
            <span className="text-xs">{likeCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="h-8 px-2 text-slate-500"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            <span className="text-xs">{item.comment_count}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-slate-500"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          className={`h-8 px-2 ${saved ? 'text-primary' : 'text-slate-500'}`}
        >
          <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
        </Button>
      </div>

      {/* Comments Section (expandable) */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-app">
          <p className="text-sm text-slate-500 text-center">
            Comments coming soon
          </p>
        </div>
      )}
    </div>
  )
}
