/**
 * Fix Calendar Blocks RLS Policy
 * Restores public read access for viewing availability on profiles
 */
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://faqiwcrnltuqvhkmzrxp.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
  console.log('🔧 Fixing calendar_blocks RLS policies...\n')

  // The RLS fix SQL
  const sql = `
    -- Drop the restrictive SELECT policy
    DROP POLICY IF EXISTS "Users can view own calendar blocks" ON calendar_blocks;

    -- Create public read policy for availability viewing
    DROP POLICY IF EXISTS "Anyone can view calendar blocks for availability" ON calendar_blocks;
    CREATE POLICY "Anyone can view calendar blocks for availability"
      ON calendar_blocks FOR SELECT
      USING (true);

    -- Ensure write policies exist
    DROP POLICY IF EXISTS "Users can insert own calendar blocks" ON calendar_blocks;
    CREATE POLICY "Users can insert own calendar blocks"
      ON calendar_blocks FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update own calendar blocks" ON calendar_blocks;
    CREATE POLICY "Users can update own calendar blocks"
      ON calendar_blocks FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can delete own calendar blocks" ON calendar_blocks;
    CREATE POLICY "Users can delete own calendar blocks"
      ON calendar_blocks FOR DELETE
      USING (auth.uid() = user_id);
  `

  // Execute via RPC or direct query
  // Note: Supabase JS client doesn't support raw SQL execution
  // We'll need to use individual policy operations or the REST API

  // For now, let's verify the calendar_blocks table exists
  const { data, error } = await supabase
    .from('calendar_blocks')
    .select('id')
    .limit(1)

  if (error) {
    console.log('❌ Error accessing calendar_blocks:', error.message)
    console.log('\nThe table may not exist or there may be RLS issues.')
    console.log('\nPlease apply the SQL migration manually via Supabase Dashboard:')
    console.log('  1. Go to https://supabase.com/dashboard')
    console.log('  2. Select your project')
    console.log('  3. Go to SQL Editor')
    console.log('  4. Run the SQL from: supabase/migrations/20251215000000_fix_calendar_blocks_rls.sql')
  } else {
    console.log('✅ calendar_blocks table is accessible')
    console.log(`   Found ${data?.length || 0} blocks (limited to 1)`)
    console.log('\n⚠️  Note: To fully fix RLS, you need to run the SQL migration.')
    console.log('   The Supabase JS client cannot modify RLS policies directly.')
    console.log('\n   Options:')
    console.log('   1. Run via Supabase Dashboard SQL Editor')
    console.log('   2. Run: npx supabase db push --linked')
    console.log('   3. Connect via psql and run the migration SQL')
  }

  console.log('\n═══════════════════════════════════════════════════════')
  console.log('  Migration file ready at:')
  console.log('  supabase/migrations/20251215000000_fix_calendar_blocks_rls.sql')
  console.log('═══════════════════════════════════════════════════════')
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
