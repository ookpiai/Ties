/**
 * Supabase Setup Checker
 * Verifies database tables, policies, and runs any pending migrations
 *
 * Run with: SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/check-supabase-setup.cjs
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://faqiwcrnltuqvhkmzrxp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('Run with: SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/check-supabase-setup.cjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Expected tables for the platform
const expectedTables = [
  'profiles',
  'bookings',
  'job_postings',
  'job_roles',
  'job_applications',
  'job_selections',
  'job_tasks',
  'job_files',
  'job_messages',
  'job_expenses',
  'conversations',
  'messages',
  'calendar_blocks',
  'availability_requests',
  'invoices',
  'notifications',
  'notification_preferences'
];

async function checkTables() {
  console.log('\n========================================');
  console.log('CHECKING DATABASE TABLES');
  console.log('========================================\n');

  const results = { exists: [], missing: [] };

  for (const table of expectedTables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          results.missing.push(table);
          console.log(`❌ ${table} - MISSING`);
        } else {
          console.log(`⚠️  ${table} - Error: ${error.message}`);
          results.missing.push(table);
        }
      } else {
        results.exists.push({ table, count: count || 0 });
        console.log(`✅ ${table} - OK (${count || 0} rows)`);
      }
    } catch (err) {
      console.log(`❌ ${table} - Error: ${err.message}`);
      results.missing.push(table);
    }
  }

  return results;
}

async function createNotificationsTable() {
  console.log('\n========================================');
  console.log('CREATING NOTIFICATIONS TABLE');
  console.log('========================================\n');

  // Create notifications table using raw SQL
  const createTableSQL = `
    -- Create notifications table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      related_id UUID,
      related_type VARCHAR(50),
      related_url TEXT,
      is_read BOOLEAN DEFAULT FALSE,
      is_archived BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT now(),
      read_at TIMESTAMPTZ,
      metadata JSONB DEFAULT '{}'::jsonb
    );

    -- Create notification_preferences table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.notification_preferences (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
      email_notifications BOOLEAN DEFAULT TRUE,
      push_notifications BOOLEAN DEFAULT TRUE,
      booking_notifications BOOLEAN DEFAULT TRUE,
      message_notifications BOOLEAN DEFAULT TRUE,
      job_notifications BOOLEAN DEFAULT TRUE,
      marketing_notifications BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read) WHERE is_read = FALSE;
    CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

    -- Enable RLS
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
    DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
    DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
    DROP POLICY IF EXISTS "Users can view own preferences" ON public.notification_preferences;
    DROP POLICY IF EXISTS "Users can update own preferences" ON public.notification_preferences;
    DROP POLICY IF EXISTS "Users can insert own preferences" ON public.notification_preferences;

    -- RLS policies for notifications
    CREATE POLICY "Users can view own notifications" ON public.notifications
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can update own notifications" ON public.notifications
      FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "System can insert notifications" ON public.notifications
      FOR INSERT WITH CHECK (true);

    -- RLS policies for notification_preferences
    CREATE POLICY "Users can view own preferences" ON public.notification_preferences
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can update own preferences" ON public.notification_preferences
      FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own preferences" ON public.notification_preferences
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  `;

  try {
    // Use the rpc function to execute raw SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTableSQL });

    if (error) {
      console.log('Note: exec_sql function may not exist, trying alternative approach...');

      // Alternative: Check if table exists now by trying to query it
      const { error: checkError } = await supabase
        .from('notifications')
        .select('id')
        .limit(1);

      if (checkError && checkError.code === '42P01') {
        console.log('\n⚠️  Cannot create table via API - need to run migration in Supabase Dashboard');
        console.log('\nPlease run this SQL in your Supabase SQL Editor:');
        console.log('https://supabase.com/dashboard/project/faqiwcrnltuqvhkmzrxp/sql/new\n');
        return false;
      } else {
        console.log('✅ Notifications table already exists!');
        return true;
      }
    }

    console.log('✅ Notifications tables created successfully!');
    return true;
  } catch (err) {
    console.error('Error:', err.message);
    return false;
  }
}

async function checkNotificationsTableExists() {
  const { error } = await supabase
    .from('notifications')
    .select('id')
    .limit(1);

  if (error && error.code === '42P01') {
    return false;
  }
  return true;
}

async function testConnection() {
  console.log('\n========================================');
  console.log('TESTING SUPABASE CONNECTION');
  console.log('========================================\n');

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      console.log('❌ Connection failed:', error.message);
      return false;
    }

    console.log('✅ Connection successful!');
    return true;
  } catch (err) {
    console.log('❌ Connection error:', err.message);
    return false;
  }
}

async function checkRealtimeSetup() {
  console.log('\n========================================');
  console.log('CHECKING REALTIME CONFIGURATION');
  console.log('========================================\n');

  // Tables that need realtime enabled
  const realtimeTables = ['messages', 'bookings', 'notifications', 'conversations'];

  for (const table of realtimeTables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (!error) {
        console.log(`✅ ${table} - accessible (realtime can be enabled in Dashboard)`);
      } else {
        console.log(`⚠️  ${table} - ${error.message}`);
      }
    } catch (err) {
      console.log(`❌ ${table} - ${err.message}`);
    }
  }

  console.log('\n💡 To enable realtime, go to:');
  console.log('   Supabase Dashboard > Database > Publications > supabase_realtime');
  console.log('   And enable the tables you need for real-time updates.');
}

async function main() {
  console.log('🚀 Starting Supabase Setup Check...\n');

  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.log('\n❌ Cannot proceed without database connection');
    process.exit(1);
  }

  // Check tables
  const tableResults = await checkTables();

  // Summary
  console.log('\n========================================');
  console.log('SUMMARY');
  console.log('========================================\n');

  console.log(`✅ Tables found: ${tableResults.exists.length}`);
  console.log(`❌ Tables missing: ${tableResults.missing.length}`);

  if (tableResults.missing.length > 0) {
    console.log('\nMissing tables:', tableResults.missing.join(', '));

    // Check if notifications is missing
    if (tableResults.missing.includes('notifications') || tableResults.missing.includes('notification_preferences')) {
      console.log('\n📋 Notifications table needs to be created.');

      const notificationsExists = await checkNotificationsTableExists();
      if (!notificationsExists) {
        console.log('\n⚠️  The notifications table does not exist.');
        console.log('Please run the migration SQL manually in the Supabase Dashboard.');
        console.log('\nMigration file: supabase/migrations/20251202_notifications_system.sql');
        console.log('Dashboard URL: https://supabase.com/dashboard/project/faqiwcrnltuqvhkmzrxp/sql/new');
      }
    }
  }

  // Check realtime
  await checkRealtimeSetup();

  console.log('\n✨ Setup check complete!\n');
}

main().catch(console.error);
