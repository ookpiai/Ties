/**
 * Run Notification Migration
 * Run with: SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/run-notification-migration.cjs
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://faqiwcrnltuqvhkmzrxp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('Run with: SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/run-notification-migration.cjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration() {
  console.log('Starting notification migration...');

  // Test connection first
  const { data: testData, error: testError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);

  if (testError) {
    console.error('Connection test failed:', testError);
    return;
  }
  console.log('Connection OK');

  // Create notifications table
  console.log('Creating notifications table...');
  const { error: tableError } = await supabase.rpc('create_notifications_table');

  if (tableError && !tableError.message.includes('already exists')) {
    console.log('Table creation note:', tableError.message);
  }

  // Verify table exists by trying to query it
  const { data: notifData, error: notifError } = await supabase
    .from('notifications')
    .select('id')
    .limit(1);

  if (notifError) {
    console.log('Notifications table status:', notifError.message);
    console.log('You may need to run the migration SQL manually in the Supabase Dashboard');
  } else {
    console.log('Notifications table exists!');
  }

  console.log('Migration check complete');
}

runMigration().catch(console.error);
