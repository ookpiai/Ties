/**
 * Availability API Tests
 * Run these tests to verify calendar functionality
 */

import {
  createCalendarBlock,
  getCalendarBlocks,
  checkAvailability,
  areDatesAvailable,
  deleteCalendarBlock,
  checkDateOverlap
} from '../api/availability'

/**
 * Test 1: Create a manual calendar block
 */
export async function testCreateBlock(userId: string) {
  console.log('Test 1: Creating manual calendar block...')

  try {
    const startDate = new Date('2025-12-01T00:00:00Z')
    const endDate = new Date('2025-12-05T23:59:59Z')

    const block = await createCalendarBlock({
      user_id: userId,
      start_date: startDate,
      end_date: endDate,
      reason: 'manual',
      notes: 'Test block - Holiday vacation'
    })

    console.log('✅ Block created:', block)
    return block
  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  }
}

/**
 * Test 2: Get calendar blocks for user
 */
export async function testGetBlocks(userId: string) {
  console.log('Test 2: Fetching calendar blocks...')

  try {
    const blocks = await getCalendarBlocks(userId)
    console.log(`✅ Found ${blocks.length} blocks:`, blocks)
    return blocks
  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  }
}

/**
 * Test 3: Check availability for date range
 */
export async function testCheckAvailability(userId: string) {
  console.log('Test 3: Checking availability...')

  try {
    const startDate = new Date('2025-12-01')
    const endDate = new Date('2025-12-10')

    const availability = await checkAvailability(userId, startDate, endDate)
    console.log('✅ Availability:', availability)

    // Count available vs blocked days
    const availableDays = availability.filter(d => d.is_available).length
    const blockedDays = availability.filter(d => !d.is_available).length

    console.log(`   Available: ${availableDays} days`)
    console.log(`   Blocked: ${blockedDays} days`)

    return availability
  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  }
}

/**
 * Test 4: Quick availability check
 */
export async function testQuickCheck(userId: string) {
  console.log('Test 4: Quick availability check...')

  try {
    // Check blocked dates (should be false)
    const blockedCheck = await areDatesAvailable(
      userId,
      new Date('2025-12-02'),
      new Date('2025-12-04')
    )
    console.log('✅ Blocked dates available?', blockedCheck, '(should be false)')

    // Check available dates (should be true)
    const availableCheck = await areDatesAvailable(
      userId,
      new Date('2025-12-20'),
      new Date('2025-12-22')
    )
    console.log('✅ Available dates free?', availableCheck, '(should be true)')

    return { blockedCheck, availableCheck }
  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  }
}

/**
 * Test 5: Check overlap detection
 */
export async function testOverlapDetection(userId: string) {
  console.log('Test 5: Testing overlap detection...')

  try {
    // This should return true (overlaps with existing block)
    const hasOverlap = await checkDateOverlap(
      userId,
      new Date('2025-12-03'),
      new Date('2025-12-06')
    )
    console.log('✅ Overlap detected?', hasOverlap, '(should be true)')

    // This should return false (no overlap)
    const noOverlap = await checkDateOverlap(
      userId,
      new Date('2025-12-20'),
      new Date('2025-12-22')
    )
    console.log('✅ No overlap?', !noOverlap, '(should be true)')

    return { hasOverlap, noOverlap }
  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  }
}

/**
 * Test 6: Try creating overlapping block (should fail)
 */
export async function testOverlapPrevention(userId: string) {
  console.log('Test 6: Testing overlap prevention...')

  try {
    await createCalendarBlock({
      user_id: userId,
      start_date: new Date('2025-12-02'),
      end_date: new Date('2025-12-06'),
      reason: 'manual',
      notes: 'This should fail'
    })

    console.error('❌ Test failed: Should have prevented overlapping block')
    return false
  } catch (error) {
    console.log('✅ Correctly prevented overlapping block:', error.message)
    return true
  }
}

/**
 * Test 7: Delete calendar block
 */
export async function testDeleteBlock(blockId: string) {
  console.log('Test 7: Deleting calendar block...')

  try {
    await deleteCalendarBlock(blockId)
    console.log('✅ Block deleted successfully')
    return true
  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  }
}

/**
 * Run all tests
 */
export async function runAllTests(userId: string) {
  console.log('🧪 Running Availability API Tests...\n')

  try {
    // Test 1: Create block
    const block = await testCreateBlock(userId)
    console.log('')

    // Test 2: Get blocks
    await testGetBlocks(userId)
    console.log('')

    // Test 3: Check availability
    await testCheckAvailability(userId)
    console.log('')

    // Test 4: Quick check
    await testQuickCheck(userId)
    console.log('')

    // Test 5: Overlap detection
    await testOverlapDetection(userId)
    console.log('')

    // Test 6: Overlap prevention
    await testOverlapPrevention(userId)
    console.log('')

    // Test 7: Cleanup - delete test block
    if (block?.id) {
      await testDeleteBlock(block.id)
    }
    console.log('')

    console.log('✅ All tests passed!')
  } catch (error) {
    console.error('❌ Tests failed:', error)
  }
}

// Export for use in console
if (typeof window !== 'undefined') {
  (window as any).availabilityTests = {
    runAllTests,
    testCreateBlock,
    testGetBlocks,
    testCheckAvailability,
    testQuickCheck,
    testOverlapDetection,
    testOverlapPrevention,
    testDeleteBlock
  }
}
