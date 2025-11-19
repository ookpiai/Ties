/**
 * BOOK NOW BUTTON
 * Day 27 - Phase 4A
 *
 * Shows on public profile pages
 * Opens BookingRequestModal when clicked
 */

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import BookingRequestModal from './BookingRequestModal'

const BookNowButton = ({
  freelancerId,
  freelancerName,
  hourlyRate,
  dailyRate,
  isOwnProfile = false,
  disabled = false
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Don't show button on own profile
  if (isOwnProfile) {
    return null
  }

  // Don't show button if no rates are set
  if (!hourlyRate && !dailyRate) {
    return null
  }

  const handleClick = () => {
    setIsModalOpen(true)
  }

  // Determine rate display
  const rateDisplay = hourlyRate
    ? `$${hourlyRate}/hour`
    : dailyRate
      ? `$${dailyRate}/day`
      : 'Rate not set'

  return (
    <>
      <Button
        size="lg"
        className="w-full sm:w-auto"
        onClick={handleClick}
        disabled={disabled}
      >
        <Calendar className="mr-2 h-5 w-5" />
        Book Now
        {(hourlyRate || dailyRate) && (
          <span className="ml-2 text-sm opacity-90">
            ({rateDisplay})
          </span>
        )}
      </Button>

      {isModalOpen && (
        <BookingRequestModal
          freelancerId={freelancerId}
          freelancerName={freelancerName}
          hourlyRate={hourlyRate}
          dailyRate={dailyRate}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}

export default BookNowButton
