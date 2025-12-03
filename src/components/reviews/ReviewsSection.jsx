/**
 * REVIEWS SECTION
 * Display reviews on a profile with rating summary and individual reviews
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Star,
  StarHalf,
  ThumbsUp,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Loader2,
  Award,
  Clock
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { getReviewsForUser, getProfileRating, markReviewHelpful } from '../../api/reviews'
import { useAuth } from '../../App'

// Star rating display component
const StarRating = ({ rating, size = 'md', showValue = true }) => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className={`${sizeClass} fill-yellow-400 text-yellow-400`} />
        ))}
        {hasHalfStar && (
          <StarHalf className={`${sizeClass} fill-yellow-400 text-yellow-400`} />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className={`${sizeClass} text-gray-300`} />
        ))}
      </div>
      {showValue && (
        <span className={`font-semibold ${size === 'lg' ? 'text-xl' : 'text-sm'} ml-1`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

// Individual review card
const ReviewCard = ({ review, currentUserId, onHelpful }) => {
  const [showResponse, setShowResponse] = useState(false)
  const [isVoting, setIsVoting] = useState(false)

  const handleHelpful = async () => {
    if (!currentUserId || isVoting) return
    setIsVoting(true)
    try {
      await markReviewHelpful(review.id, true)
      if (onHelpful) onHelpful()
    } catch (error) {
      console.error('Error marking helpful:', error)
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      {/* Reviewer Info */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={review.reviewer?.avatar_url} />
          <AvatarFallback>
            {review.reviewer?.display_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h4 className="font-medium text-sm text-slate-900 dark:text-white">
                {review.reviewer?.display_name || 'Anonymous'}
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="capitalize">{review.reviewer?.role}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</span>
              </div>
            </div>
            <StarRating rating={review.rating} size="sm" showValue={false} />
          </div>

          {/* Review Content */}
          {review.title && (
            <h5 className="font-semibold text-sm mt-2 text-slate-800 dark:text-slate-200">
              {review.title}
            </h5>
          )}
          {review.text && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {review.text}
            </p>
          )}

          {/* Service Context */}
          {review.service_provided && (
            <Badge variant="outline" className="mt-2 text-xs">
              Service: {review.service_provided}
            </Badge>
          )}

          {/* Detailed Ratings */}
          {(review.communication_rating || review.professionalism_rating ||
            review.quality_rating || review.value_rating) && (
            <div className="grid grid-cols-2 gap-2 mt-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              {review.communication_rating && (
                <div className="text-xs">
                  <span className="text-slate-500">Communication:</span>
                  <StarRating rating={review.communication_rating} size="sm" showValue={false} />
                </div>
              )}
              {review.professionalism_rating && (
                <div className="text-xs">
                  <span className="text-slate-500">Professionalism:</span>
                  <StarRating rating={review.professionalism_rating} size="sm" showValue={false} />
                </div>
              )}
              {review.quality_rating && (
                <div className="text-xs">
                  <span className="text-slate-500">Quality:</span>
                  <StarRating rating={review.quality_rating} size="sm" showValue={false} />
                </div>
              )}
              {review.value_rating && (
                <div className="text-xs">
                  <span className="text-slate-500">Value:</span>
                  <StarRating rating={review.value_rating} size="sm" showValue={false} />
                </div>
              )}
            </div>
          )}

          {/* Response */}
          {review.response_text && (
            <div className="mt-3">
              <button
                onClick={() => setShowResponse(!showResponse)}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <MessageSquare className="w-3 h-3" />
                Owner Response
                {showResponse ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {showResponse && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                  <p className="text-xs text-slate-500 mb-1">
                    Response from {format(new Date(review.response_at), 'MMM d, yyyy')}
                  </p>
                  {review.response_text}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={handleHelpful}
              disabled={!currentUserId || isVoting}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary transition-colors disabled:opacity-50"
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${review.helpful_count > 0 ? 'text-primary' : ''}`} />
              Helpful {review.helpful_count > 0 && `(${review.helpful_count})`}
            </button>
            {review.is_verified && (
              <Badge variant="secondary" className="text-xs">
                <Award className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Reviews Section
const ReviewsSection = ({ userId, showSummary = true, limit = 5 }) => {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [ratingStats, setRatingStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    if (userId) {
      loadReviews()
    }
  }, [userId])

  const loadReviews = async () => {
    setIsLoading(true)
    try {
      const [reviewsData, statsData] = await Promise.all([
        getReviewsForUser(userId),
        getProfileRating(userId)
      ])
      setReviews(reviewsData || [])
      setRatingStats(statsData)
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  const displayedReviews = showAll ? reviews : reviews.slice(0, limit)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Reviews
          {ratingStats?.total_reviews > 0 && (
            <Badge variant="secondary">{ratingStats.total_reviews}</Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Rating Summary */}
        {showSummary && ratingStats && ratingStats.total_reviews > 0 && (
          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-start gap-6">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-900 dark:text-white">
                  {ratingStats.average_rating.toFixed(1)}
                </div>
                <StarRating rating={ratingStats.average_rating} size="md" showValue={false} />
                <p className="text-xs text-slate-500 mt-1">
                  {ratingStats.total_reviews} review{ratingStats.total_reviews !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = ratingStats.rating_distribution?.[stars] || 0
                  const percentage = ratingStats.total_reviews > 0
                    ? (count / ratingStats.total_reviews) * 100
                    : 0

                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-3">{stars}</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <Progress value={percentage} className="h-2 flex-1" />
                      <span className="text-xs text-slate-500 w-6">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Category Averages */}
            {(ratingStats.avg_communication || ratingStats.avg_professionalism ||
              ratingStats.avg_quality || ratingStats.avg_value) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                {ratingStats.avg_communication && (
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Communication</p>
                    <StarRating rating={ratingStats.avg_communication} size="sm" />
                  </div>
                )}
                {ratingStats.avg_professionalism && (
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Professionalism</p>
                    <StarRating rating={ratingStats.avg_professionalism} size="sm" />
                  </div>
                )}
                {ratingStats.avg_quality && (
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Quality</p>
                    <StarRating rating={ratingStats.avg_quality} size="sm" />
                  </div>
                )}
                {ratingStats.avg_value && (
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Value</p>
                    <StarRating rating={ratingStats.avg_value} size="sm" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No reviews yet</p>
            <p className="text-sm text-slate-400">
              Reviews will appear here after completing bookings
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {displayedReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  currentUserId={user?.id}
                  onHelpful={loadReviews}
                />
              ))}
            </div>

            {/* Show More Button */}
            {reviews.length > limit && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Show All {reviews.length} Reviews
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export { ReviewsSection, StarRating, ReviewCard }
export default ReviewsSection
