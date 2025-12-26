import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/App'
import { Link } from 'react-router-dom'
import {
  Compass,
  Users,
  MapPin,
  RefreshCw,
  Loader2,
  Sparkles,
  ChevronDown,
  Search,
  Plus,
  Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import FeedCard from './FeedCard'
import EmptyState from '@/components/ui/EmptyState'
import {
  getFeed,
  subscribeToFeed,
  getUserLocation,
  type FeedItem,
  type FeedType,
  type GetFeedParams
} from '@/api/feed'

const RADIUS_OPTIONS = [
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
  { value: -1, label: 'Anywhere' }
]

export default function SocialFeed() {
  const { user } = useAuth()

  // Feed state
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Filter state
  const [feedType, setFeedType] = useState<FeedType>('for_you')
  const [radius, setRadius] = useState(50)

  // Location state
  const [userLocation, setUserLocation] = useState<{
    latitude: number | null
    longitude: number | null
    city: string | null
  } | null>(null)
  const [locationRequested, setLocationRequested] = useState(false)

  // New items notification
  const [newItemsCount, setNewItemsCount] = useState(0)

  // Refs for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load user's saved location
  useEffect(() => {
    async function loadLocation() {
      const location = await getUserLocation()
      if (location) {
        setUserLocation(location)
      }
    }
    loadLocation()
  }, [])

  // Build feed params
  const getFeedParams = useCallback((): GetFeedParams => {
    const params: GetFeedParams = {
      feedType,
      limit: 20
    }

    if (userLocation?.latitude && userLocation?.longitude) {
      params.latitude = userLocation.latitude
      params.longitude = userLocation.longitude
      if (radius > 0) {
        params.radiusKm = radius
      }
    }

    if (cursor) {
      params.cursor = cursor
    }

    return params
  }, [feedType, radius, userLocation, cursor])

  // Load feed
  const loadFeed = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setLoading(true)
        setCursor(null)
        setItems([])
      }

      const params = getFeedParams()
      if (refresh) {
        delete params.cursor
      }

      const response = await getFeed(params)

      if (refresh) {
        setItems(response.items)
      } else {
        setItems(prev => [...prev, ...response.items])
      }

      setCursor(response.nextCursor)
      setHasMore(response.hasMore)
      setError(null)
    } catch (err) {
      console.error('Error loading feed:', err)
      setError('Failed to load feed')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [getFeedParams])

  // Initial load
  useEffect(() => {
    loadFeed(true)
  }, [feedType, radius, userLocation])

  // Load more on scroll
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || loading) return
    setLoadingMore(true)
    loadFeed(false)
  }, [loadingMore, hasMore, loading, loadFeed])

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [loadMore])

  // Real-time subscription for new items
  useEffect(() => {
    const unsubscribe = subscribeToFeed((newItem) => {
      // Only notify if it's not the user's own post
      if (newItem.actor_id !== user?.id) {
        setNewItemsCount(prev => prev + 1)
      }
    })

    return () => unsubscribe()
  }, [user?.id])

  // Request browser location
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setLocationRequested(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          city: null // Would need reverse geocoding
        })
        setLocationRequested(false)
      },
      (err) => {
        console.error('Error getting location:', err)
        setLocationRequested(false)
      }
    )
  }

  // Handle new items refresh
  const handleNewItemsRefresh = () => {
    setNewItemsCount(0)
    loadFeed(true)
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle item hide
  const handleItemHide = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId))
  }

  const getRoleSpecificGreeting = () => {
    switch (user?.role) {
      case 'Freelancer':
        return 'Discover opportunities near you'
      case 'Organiser':
        return 'Find talent for your next project'
      case 'Vendor':
        return 'Connect with event organizers'
      case 'Venue':
        return 'See who\'s looking for spaces'
      default:
        return 'See what\'s happening nearby'
    }
  }

  return (
    <div className="min-h-screen bg-app" ref={containerRef}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome back, {user?.display_name?.split(' ')[0] || 'there'}
            </h1>
            <div className="flex items-center space-x-2">
              <Link to="/notifications">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {getRoleSpecificGreeting()}
          </p>
        </div>

        {/* Feed Type Tabs */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-app">
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <Button
              variant={feedType === 'for_you' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFeedType('for_you')}
              className="h-8"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              For You
            </Button>
            <Button
              variant={feedType === 'following' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFeedType('following')}
              className="h-8"
            >
              <Users className="h-4 w-4 mr-1" />
              Following
            </Button>
            <Button
              variant={feedType === 'nearby' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFeedType('nearby')}
              className="h-8"
            >
              <MapPin className="h-4 w-4 mr-1" />
              Nearby
            </Button>
          </div>

          {/* Radius Selector */}
          {feedType === 'nearby' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {radius > 0 ? `${radius} km` : 'Anywhere'}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {RADIUS_OPTIONS.map(option => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setRadius(option.value)}
                    className={radius === option.value ? 'bg-primary/10' : ''}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Location Request Banner */}
        {feedType === 'nearby' && !userLocation?.latitude && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 dark:text-blue-100">
                  Enable location for nearby content
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Share your location to see what's happening around you.
                </p>
                <Button
                  size="sm"
                  onClick={requestLocation}
                  disabled={locationRequested}
                  className="mt-2"
                >
                  {locationRequested ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Getting location...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-1" />
                      Share Location
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* New Items Notification */}
        {newItemsCount > 0 && (
          <button
            onClick={handleNewItemsRefresh}
            className="w-full mb-4 py-2 px-4 bg-primary text-white rounded-full text-sm font-medium flex items-center justify-center space-x-2 hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{newItemsCount} new {newItemsCount === 1 ? 'post' : 'posts'}</span>
          </button>
        )}

        {/* Feed Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-slate-500">Loading feed...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => loadFeed(true)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={feedType === 'following' ? Users : feedType === 'nearby' ? MapPin : Compass}
            title={
              feedType === 'following'
                ? 'No posts from people you follow'
                : feedType === 'nearby'
                ? 'No nearby activity yet'
                : 'No posts yet'
            }
            description={
              feedType === 'following'
                ? 'Follow some creatives to see their updates here.'
                : feedType === 'nearby'
                ? 'Be the first to share something in your area!'
                : 'The feed is empty. Check back later for updates from the community.'
            }
            action={
              feedType === 'following'
                ? { label: 'Discover People', href: '/discover', icon: Search }
                : feedType === 'nearby'
                ? { label: 'Post an Update', href: '/profile', icon: Plus }
                : undefined
            }
          />
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <FeedCard
                key={item.id}
                item={item}
                currentUserId={user?.id}
                onHide={() => handleItemHide(item.id)}
              />
            ))}

            {/* Load More Trigger */}
            <div ref={loadMoreRef} className="py-4">
              {loadingMore && (
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
              {!hasMore && items.length > 0 && (
                <p className="text-center text-sm text-slate-500">
                  You've seen all recent posts
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
