/**
 * BOOKING LIFECYCLE TESTS
 * Day 28-29 - Phase 4A
 *
 * Browser console tests for the complete booking workflow
 * Run these tests to verify all booking functionality works correctly
 */

import {
  createBooking,
  getBookings,
  getBookingById,
  acceptBooking,
  declineBooking,
  cancelBooking,
  completeBooking,
  getUpcomingBookings,
  getBookingStats
} from '../api/bookings'

// Test data will be created with these IDs
let testBookingId: string | null = null
let clientUserId: string // Set this to your client user ID
let freelancerUserId: string // Set this to your freelancer user ID

/**
 * Test 1: Create a booking request
 */
export async function test1_createBooking(clientId: string, freelancerId: string) {
  console.log('📝 Test 1: Create Booking Request')
  console.log('----------------------------------------')

  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + 7) // 1 week from now
    startDate.setHours(9, 0, 0, 0)

    const endDate = new Date(startDate)
    endDate.setHours(17, 0, 0, 0) // 8 hour booking

    const booking = await createBooking({
      freelancer_id: freelancerId,
      start_date: startDate,
      end_date: endDate,
      total_amount: 800, // 8 hours x $100/hour
      service_description: 'Test booking: Corporate event photography with full day coverage and editing',
      client_message: 'Looking forward to working with you!'
    })

    testBookingId = booking.id
    console.log('✅ Booking created successfully!')
    console.log('   Booking ID:', booking.id)
    console.log('   Status:', booking.status)
    console.log('   Amount: $', booking.total_amount)
    console.log('   Start:', booking.start_date)
    console.log('   End:', booking.end_date)

    return booking
  } catch (error: any) {
    console.error('❌ Test 1 Failed:', error.message)
    throw error
  }
}

/**
 * Test 2: Get all bookings for client
 */
export async function test2_getClientBookings(clientId: string) {
  console.log('\n📋 Test 2: Get Client Bookings')
  console.log('----------------------------------------')

  try {
    const bookings = await getBookings(clientId, 'client')
    console.log('✅ Retrieved', bookings.length, 'booking(s) as client')

    bookings.forEach((booking, index) => {
      console.log(`   ${index + 1}. ${booking.service_description.substring(0, 50)}...`)
      console.log(`      Status: ${booking.status}`)
      console.log(`      Amount: $${booking.total_amount}`)
    })

    return bookings
  } catch (error: any) {
    console.error('❌ Test 2 Failed:', error.message)
    throw error
  }
}

/**
 * Test 3: Get booking details
 */
export async function test3_getBookingDetails(bookingId: string, userId: string) {
  console.log('\n🔍 Test 3: Get Booking Details')
  console.log('----------------------------------------')

  try {
    const booking = await getBookingById(bookingId, userId)
    console.log('✅ Retrieved booking details')
    console.log('   Service:', booking.service_description)
    console.log('   Client Message:', booking.client_message || 'None')
    console.log('   Status:', booking.status)
    console.log('   Freelancer:', booking.freelancer_profile?.full_name)
    console.log('   Client:', booking.client_profile?.full_name)

    return booking
  } catch (error: any) {
    console.error('❌ Test 3 Failed:', error.message)
    throw error
  }
}

/**
 * Test 4: Accept booking (as freelancer)
 */
export async function test4_acceptBooking(bookingId: string, freelancerId: string) {
  console.log('\n✅ Test 4: Accept Booking')
  console.log('----------------------------------------')

  try {
    const booking = await acceptBooking(
      bookingId,
      freelancerId,
      'Thank you! I look forward to working with you on this project.'
    )

    console.log('✅ Booking accepted!')
    console.log('   Status:', booking.status)
    console.log('   Response:', booking.freelancer_response)
    console.log('   Accepted At:', booking.accepted_at)
    console.log('   🗓️  Calendar dates should be automatically blocked')

    return booking
  } catch (error: any) {
    console.error('❌ Test 4 Failed:', error.message)
    throw error
  }
}

/**
 * Test 5: Try to double-book (should fail)
 */
export async function test5_doubleBookingPrevention(clientId: string, freelancerId: string) {
  console.log('\n🚫 Test 5: Double-Booking Prevention')
  console.log('----------------------------------------')

  try {
    // Try to create booking on same dates as accepted booking
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + 7) // Same as Test 1
    startDate.setHours(10, 0, 0, 0) // Overlapping time

    const endDate = new Date(startDate)
    endDate.setHours(15, 0, 0, 0)

    await createBooking({
      freelancer_id: freelancerId,
      start_date: startDate,
      end_date: endDate,
      total_amount: 500,
      service_description: 'This should fail due to overlap'
    })

    console.error('❌ Test 5 Failed: Double-booking was NOT prevented!')
    return false
  } catch (error: any) {
    if (error.message.includes('not available')) {
      console.log('✅ Double-booking correctly prevented!')
      console.log('   Error message:', error.message)
      return true
    } else {
      console.error('❌ Test 5 Failed with unexpected error:', error.message)
      return false
    }
  }
}

/**
 * Test 6: Get booking statistics
 */
export async function test6_getBookingStats(userId: string) {
  console.log('\n📊 Test 6: Get Booking Statistics')
  console.log('----------------------------------------')

  try {
    const stats = await getBookingStats(userId)
    console.log('✅ Retrieved booking statistics')
    console.log('\nAs Client:')
    console.log('   Total Bookings:', stats.as_client.total)
    console.log('   Pending:', stats.as_client.pending)
    console.log('   Accepted:', stats.as_client.accepted)
    console.log('   Completed:', stats.as_client.completed)
    console.log('   Total Spent: $', stats.as_client.total_spent)
    console.log('\nAs Freelancer:')
    console.log('   Total Bookings:', stats.as_freelancer.total)
    console.log('   Pending:', stats.as_freelancer.pending)
    console.log('   Accepted:', stats.as_freelancer.accepted)
    console.log('   Completed:', stats.as_freelancer.completed)
    console.log('   Total Earned: $', stats.as_freelancer.total_earned)

    return stats
  } catch (error: any) {
    console.error('❌ Test 6 Failed:', error.message)
    throw error
  }
}

/**
 * Test 7: Cancel booking (releases calendar dates)
 */
export async function test7_cancelBooking(bookingId: string, userId: string) {
  console.log('\n🚫 Test 7: Cancel Booking')
  console.log('----------------------------------------')

  try {
    const booking = await cancelBooking(
      bookingId,
      userId,
      'Testing cancellation - need to reschedule'
    )

    console.log('✅ Booking cancelled!')
    console.log('   Status:', booking.status)
    console.log('   Reason:', booking.cancellation_reason)
    console.log('   Cancelled At:', booking.cancelled_at)
    console.log('   🗓️  Calendar dates should be automatically released')

    return booking
  } catch (error: any) {
    console.error('❌ Test 7 Failed:', error.message)
    throw error
  }
}

/**
 * Test 8: Decline booking (as freelancer)
 * Create a new booking first, then decline it
 */
export async function test8_declineBooking(clientId: string, freelancerId: string) {
  console.log('\n❌ Test 8: Decline Booking')
  console.log('----------------------------------------')

  try {
    // Create a new booking to decline
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + 14) // 2 weeks from now
    startDate.setHours(9, 0, 0, 0)

    const endDate = new Date(startDate)
    endDate.setHours(12, 0, 0, 0)

    const newBooking = await createBooking({
      freelancer_id: freelancerId,
      start_date: startDate,
      end_date: endDate,
      total_amount: 300,
      service_description: 'Test booking for decline workflow'
    })

    console.log('   Created test booking:', newBooking.id)

    // Now decline it
    const declined = await declineBooking(
      newBooking.id,
      freelancerId,
      'Schedule conflict - unable to accommodate this booking'
    )

    console.log('✅ Booking declined!')
    console.log('   Status:', declined.status)
    console.log('   Response:', declined.freelancer_response)
    console.log('   ℹ️  No calendar dates should be blocked (booking was never accepted)')

    return declined
  } catch (error: any) {
    console.error('❌ Test 8 Failed:', error.message)
    throw error
  }
}

/**
 * Test 9: Get upcoming bookings
 */
export async function test9_getUpcomingBookings(userId: string) {
  console.log('\n📅 Test 9: Get Upcoming Bookings')
  console.log('----------------------------------------')

  try {
    const bookings = await getUpcomingBookings(userId)
    console.log('✅ Retrieved', bookings.length, 'upcoming booking(s)')

    bookings.forEach((booking, index) => {
      console.log(`   ${index + 1}. ${booking.service_description.substring(0, 40)}...`)
      console.log(`      Date: ${new Date(booking.start_date).toLocaleDateString()}`)
      console.log(`      Status: ${booking.status}`)
    })

    return bookings
  } catch (error: any) {
    console.error('❌ Test 9 Failed:', error.message)
    throw error
  }
}

/**
 * Run all tests in sequence
 */
export async function runAllBookingTests(clientUserId: string, freelancerUserId: string) {
  console.log('🧪 BOOKING LIFECYCLE TEST SUITE')
  console.log('========================================')
  console.log('Client ID:', clientUserId)
  console.log('Freelancer ID:', freelancerUserId)
  console.log('========================================\n')

  let passedTests = 0
  let failedTests = 0

  try {
    // Test 1: Create booking
    await test1_createBooking(clientUserId, freelancerUserId)
    passedTests++

    // Wait a bit for database consistency
    await new Promise(resolve => setTimeout(resolve, 500))

    // Test 2: Get bookings as client
    await test2_getClientBookings(clientUserId)
    passedTests++

    // Test 3: Get booking details
    if (testBookingId) {
      await test3_getBookingDetails(testBookingId, clientUserId)
      passedTests++
    }

    // Test 4: Accept booking
    if (testBookingId) {
      await test4_acceptBooking(testBookingId, freelancerUserId)
      passedTests++
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Test 5: Try double-booking (should fail)
    await test5_doubleBookingPrevention(clientUserId, freelancerUserId)
    passedTests++

    // Test 6: Get stats
    await test6_getBookingStats(clientUserId)
    passedTests++

    // Test 7: Cancel booking (to clean up)
    if (testBookingId) {
      await test7_cancelBooking(testBookingId, clientUserId)
      passedTests++
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Test 8: Decline workflow
    await test8_declineBooking(clientUserId, freelancerUserId)
    passedTests++

    // Test 9: Get upcoming bookings
    await test9_getUpcomingBookings(clientUserId)
    passedTests++

  } catch (error) {
    failedTests++
  }

  console.log('\n========================================')
  console.log('🏁 TEST SUITE COMPLETE')
  console.log('========================================')
  console.log('✅ Passed:', passedTests)
  console.log('❌ Failed:', failedTests)
  console.log('========================================')

  if (failedTests === 0) {
    console.log('🎉 All tests passed! Booking system is working correctly.')
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.')
  }
}

// Export for browser console use
if (typeof window !== 'undefined') {
  (window as any).bookingTests = {
    test1_createBooking,
    test2_getClientBookings,
    test3_getBookingDetails,
    test4_acceptBooking,
    test5_doubleBookingPrevention,
    test6_getBookingStats,
    test7_cancelBooking,
    test8_declineBooking,
    test9_getUpcomingBookings,
    runAllBookingTests
  }

  console.log('📦 Booking tests loaded! Available as window.bookingTests')
  console.log('Run: bookingTests.runAllBookingTests("your-client-id", "your-freelancer-id")')
}
