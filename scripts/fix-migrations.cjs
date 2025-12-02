/**
 * Fix Migration Records
 * Updates the schema_migrations table to sync with local migrations
 *
 * Run with: SUPABASE_ACCESS_TOKEN=your_token node scripts/fix-migrations.cjs
 */

const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://faqiwcrnltuqvhkmzrxp.supabase.co';
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'faqiwcrnltuqvhkmzrxp';
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!SUPABASE_ACCESS_TOKEN) {
  console.error('Error: SUPABASE_ACCESS_TOKEN environment variable is required');
  console.error('Run with: SUPABASE_ACCESS_TOKEN=your_token node scripts/fix-migrations.cjs');
  process.exit(1);
}

// List of all migrations that should be marked as applied
const migrations = [
  '006_auto_create_profile',
  '003_calendar_blocks',
  '004_bookings',
  '005_profiles_rls_fix',
  '20251110_create_organiser_and_jobs',
  '20251110_insert_test_jobs',
  '20251110_verify_and_create_organiser',
  '20251110_create_job_system',
  '20251111133504_add_workspace_features',
  '20251111133505_setup_storage_bucket',
  '20251111150000_create_messages_table',
  '20251112_add_rate_fields',
  '20251124_add_specialty_fields',
  '20251124_add_services_data',
  '20251124_add_favorites',
  '20251124_payment_system',
  '20251125_profile_advertising_system',
  '20251126_add_onboarding_completed',
  '20251129_booking_mvp_agent_system',
  '20251129_agent_verification_system',
  '20251129_badge_system_spec',
  '20251129_premium_calendar_system',
  '20251130_bookings_schema_update',
  '20251202_notifications_system'
];

async function runSQL(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });

    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function getCurrentMigrations() {
  console.log('\n📋 Checking current migration records...\n');

  try {
    const result = await runSQL('SELECT version, name FROM supabase_migrations.schema_migrations ORDER BY version');
    console.log('Current migrations in database:');
    if (result && result.length > 0) {
      result.forEach(m => console.log(`  - ${m.version}: ${m.name}`));
    } else {
      console.log('  (none found or could not read)');
    }
    return result || [];
  } catch (err) {
    console.log('Could not query migrations table:', err.message);
    return [];
  }
}

async function insertMigrationRecord(version, name) {
  const sql = `
    INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
    VALUES ('${version}', '${name}', '{}')
    ON CONFLICT (version) DO NOTHING
  `;

  try {
    await runSQL(sql);
    return true;
  } catch (err) {
    return false;
  }
}

async function main() {
  console.log('════════════════════════════════════════');
  console.log('  MIGRATION RECORDS FIXER');
  console.log('════════════════════════════════════════');

  // Get current state
  await getCurrentMigrations();

  console.log('\n🔧 Note: The CLI migration tracking is separate from your actual database state.');
  console.log('   Your tables exist and are working - the issue is just migration tracking.');

  console.log('\n📌 Recommended fix:');
  console.log('   Run: npx supabase migration repair --status applied <version>');
  console.log('   For each migration that is already applied.\n');

  // List versions that need repair
  console.log('Migrations to mark as applied:');
  migrations.forEach(m => {
    // Extract version number
    const versionMatch = m.match(/^(\d+)/);
    if (versionMatch) {
      console.log(`  npx supabase migration repair --status applied ${versionMatch[1]}`);
    }
  });

  console.log('\n💡 Alternatively, delete all local migrations and use db pull:');
  console.log('   rm -rf supabase/migrations/*');
  console.log('   npx supabase db pull\n');
}

main().catch(console.error);
