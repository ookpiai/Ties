/**
 * Verify Notifications Setup
 * Checks that triggers and functions are properly configured
 *
 * Run with: SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/verify-notifications-setup.cjs
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://faqiwcrnltuqvhkmzrxp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('Run with: SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/verify-notifications-setup.cjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkNotificationsTable() {
  console.log('\n📋 Checking notifications table structure...');

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .limit(5);

  if (error) {
    console.log('❌ Error accessing notifications:', error.message);
    return false;
  }

  console.log(`✅ Notifications table accessible (${data.length} sample rows)`);
  return true;
}

async function checkNotificationPreferences() {
  console.log('\n📋 Checking notification_preferences table...');

  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .limit(5);

  if (error) {
    console.log('❌ Error accessing notification_preferences:', error.message);
    return false;
  }

  console.log(`✅ notification_preferences table accessible (${data.length} sample rows)`);
  return true;
}

async function testCreateNotification() {
  console.log('\n🧪 Testing notification creation...');

  // Get a test user
  const { data: users, error: userError } = await supabase
    .from('profiles')
    .select('id, display_name')
    .limit(1);

  if (userError || !users || users.length === 0) {
    console.log('⚠️  No users found for testing');
    return false;
  }

  const testUserId = users[0].id;
  console.log(`   Using test user: ${users[0].display_name} (${testUserId})`);

  // Create a test notification
  const { data: notification, error: createError } = await supabase
    .from('notifications')
    .insert({
      user_id: testUserId,
      type: 'system',
      title: 'Test Notification',
      message: 'This is a test notification from the setup verification script.',
      metadata: { test: true, timestamp: new Date().toISOString() }
    })
    .select()
    .single();

  if (createError) {
    console.log('❌ Failed to create test notification:', createError.message);
    return false;
  }

  console.log(`✅ Test notification created: ${notification.id}`);

  // Clean up - delete the test notification
  const { error: deleteError } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notification.id);

  if (deleteError) {
    console.log('⚠️  Could not delete test notification:', deleteError.message);
  } else {
    console.log('🧹 Test notification cleaned up');
  }

  return true;
}

async function checkTriggers() {
  console.log('\n🔧 Checking notification triggers...');

  // We can't directly query pg_trigger from the JS client with service role
  // but we can test if triggers are working by checking if notifications
  // are created when related actions happen

  console.log('   Note: Triggers are set up via SQL migrations.');
  console.log('   To verify triggers exist, check in Supabase Dashboard:');
  console.log('   Database > Functions (for notify_ functions)');
  console.log('   Database > Triggers (for notification triggers on tables)');

  return true;
}

async function listRecentNotifications() {
  console.log('\n📜 Recent notifications in the system:');

  const { data, error } = await supabase
    .from('notifications')
    .select(`
      id,
      type,
      title,
      message,
      is_read,
      created_at,
      user_id
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.log('❌ Error fetching notifications:', error.message);
    return;
  }

  if (data.length === 0) {
    console.log('   No notifications found yet');
  } else {
    data.forEach((n, i) => {
      const readStatus = n.is_read ? '✓' : '○';
      console.log(`   ${i + 1}. [${readStatus}] ${n.type}: ${n.title}`);
      console.log(`      ${n.created_at}`);
    });
  }
}

async function checkRLSPolicies() {
  console.log('\n🔒 RLS policies check:');
  console.log('   Note: RLS is configured via migrations.');
  console.log('   To verify policies, check in Supabase Dashboard:');
  console.log('   Authentication > Policies > notifications');
  console.log('   Expected policies:');
  console.log('   - Users can view own notifications');
  console.log('   - Users can update own notifications');
  console.log('   - System can insert notifications');
}

async function checkRealtimePublication() {
  console.log('\n📡 Realtime publication:');
  console.log('   To enable realtime for notifications:');
  console.log('   1. Go to Supabase Dashboard > Database > Publications');
  console.log('   2. Click on "supabase_realtime"');
  console.log('   3. Enable the "notifications" table');
  console.log('   4. Also enable: messages, bookings, conversations');
}

async function main() {
  console.log('════════════════════════════════════════');
  console.log('  NOTIFICATIONS SETUP VERIFICATION');
  console.log('════════════════════════════════════════');

  let allPassed = true;

  // Check tables
  allPassed = await checkNotificationsTable() && allPassed;
  allPassed = await checkNotificationPreferences() && allPassed;

  // Test CRUD
  allPassed = await testCreateNotification() && allPassed;

  // Check triggers
  await checkTriggers();

  // List recent notifications
  await listRecentNotifications();

  // RLS info
  await checkRLSPolicies();

  // Realtime info
  await checkRealtimePublication();

  // Summary
  console.log('\n════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('════════════════════════════════════════');

  if (allPassed) {
    console.log('\n✅ All checks passed! Notifications system is ready.');
    console.log('\n📌 Manual steps remaining:');
    console.log('   1. Enable realtime on notifications table in Dashboard');
    console.log('   2. Verify triggers are created (check Database > Triggers)');
    console.log('   3. Test end-to-end by creating a booking\n');
  } else {
    console.log('\n⚠️  Some checks failed. Please review the errors above.\n');
  }
}

main().catch(console.error);
