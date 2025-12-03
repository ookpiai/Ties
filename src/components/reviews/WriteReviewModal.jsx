/**
 * WRITE REVIEW MODAL
 * Modal for submitting a review after a completed booking
 */

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Star, Loader2, CheckCircle } from 'lucide-react'
import { createReview } from '../../api/reviews'
import { useToast } from '@/hooks/use-toast'

// Interactive star rating input
const StarRatingInput = ({ value, onChange, label, required = false }) => {
  const [hoverValue, setHoverValue] = useState(0)

  return (
    <div className="space-y-1">
      {label && (
        <Label className="text-sm">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                star <= (hoverValue || value)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
        {value > 0 && (
          <span className="ml-2 text-sm font-medium text-slate-600">
            {value === 1 && 'Poor'}
            {value === 2 && 'Fair'}
            {value === 3 && 'Good'}
            {value === 4 && 'Very Good'}
            {value === 5 && 'Excellent'}
          </span>
        )}
      </div>
    </div>
  )
}

const WriteReviewModal = ({
  isOpen,
  onClose,
  revieweeId,
  revieweeProfile,
  bookingId,
  bookingDetails,
  onReviewSubmitted
}) => {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  // Form state
  const [rating, setRating] = useState(0)
  const [communicationRating, setCommunicationRating] = useState(0)
  const [professionalismRating, setProfessionalismRating] = useState(0)
  const [qualityRating, setQualityRating] = useState(0)
  const [valueRating, setValueRating] = useState(0)
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [showDetailedRatings, setShowDetailedRatings] = useState(false)

  const resetForm = () => {
    setRating(0)
    setCommunicationRating(0)
    setProfessionalismRating(0)
    setQualityRating(0)
    setValueRating(0)
    setTitle('')
    setText('')
    setError(null)
    setSubmitted(false)
    setShowDetailedRatings(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (rating === 0) {
      setError('Please select an overall rating')
      return
    }

    setIsSubmitting(true)

    try {
      await createReview({
        about_user_id: revieweeId,
        booking_id: bookingId,
        rating,
        communication_rating: communicationRating || undefined,
        professionalism_rating: professionalismRating || undefined,
        quality_rating: qualityRating || undefined,
        value_rating: valueRating || undefined,
        title: title.trim() || undefined,
        text: text.trim() || undefined,
        review_type: 'booking',
        service_provided: bookingDetails?.service_description
      })

      setSubmitted(true)
      toast({
        title: 'Review Submitted',
        description: 'Thank you for your feedback!'
      })

      if (onReviewSubmitted) {
        onReviewSubmitted()
      }

      // Close after delay
      setTimeout(() => {
        handleClose()
      }, 2000)

    } catch (err) {
      console.error('Error submitting review:', err)
      setError(err.message || 'Failed to submit review')
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to submit review'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[450px]">
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Review Submitted!</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Thank you for sharing your experience. Your review helps others make informed decisions.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience working with this professional
          </DialogDescription>
        </DialogHeader>

        {/* Reviewee Info */}
        {revieweeProfile && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={revieweeProfile.avatar_url} />
              <AvatarFallback>
                {revieweeProfile.display_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{revieweeProfile.display_name}</h4>
              <p className="text-sm text-slate-500 capitalize">
                {revieweeProfile.role}
              </p>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Overall Rating */}
          <StarRatingInput
            value={rating}
            onChange={setRating}
            label="Overall Rating"
            required
          />

          {/* Toggle Detailed Ratings */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowDetailedRatings(!showDetailedRatings)}
            className="text-primary"
          >
            {showDetailedRatings ? 'Hide' : 'Add'} Detailed Ratings
          </Button>

          {/* Detailed Ratings */}
          {showDetailedRatings && (
            <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <StarRatingInput
                value={communicationRating}
                onChange={setCommunicationRating}
                label="Communication"
              />
              <StarRatingInput
                value={professionalismRating}
                onChange={setProfessionalismRating}
                label="Professionalism"
              />
              <StarRatingInput
                value={qualityRating}
                onChange={setQualityRating}
                label="Quality of Work"
              />
              <StarRatingInput
                value={valueRating}
                onChange={setValueRating}
                label="Value for Money"
              />
            </div>
          )}

          {/* Review Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title (optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              maxLength={200}
            />
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="text">Your Review (optional)</Label>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share details about your experience..."
              rows={4}
              maxLength={2000}
            />
            <p className="text-xs text-slate-500 text-right">
              {text.length}/2000
            </p>
          </div>

          {/* Guidelines */}
          <div className="text-xs text-slate-500 space-y-1 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <p className="font-medium">Review Guidelines:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Be honest and constructive</li>
              <li>Focus on the professional service provided</li>
              <li>Avoid personal attacks or inappropriate language</li>
              <li>Include specific details when possible</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { WriteReviewModal, StarRatingInput }
export default WriteReviewModal
