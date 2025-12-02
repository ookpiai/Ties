/**
 * Refresh Supabase Schema Cache
 * Uses the management API to reload PostgREST schema
 *
 * Run with: SUPABASE_ACCESS_TOKEN=your_token node scripts/refresh-schema-cache.cjs
 */

const https = require('https');

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'faqiwcrnltuqvhkmzrxp';

if (!SUPABASE_ACCESS_TOKEN) {
  console.error('Error: SUPABASE_ACCESS_TOKEN environment variable is required');
  console.error('Run with: SUPABASE_ACCESS_TOKEN=your_token node scripts/refresh-schema-cache.cjs');
  process.exit(1);
}

async function reloadSchema() {
  console.log('🔄 Requesting PostgREST schema reload...\n');

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_REF}/postgrest`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Response status: ${res.statusCode}`);
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ Schema reload requested successfully!');
          console.log('\nThe schema cache will refresh within 1-2 minutes.');
          resolve(true);
        } else {
          console.log('Response:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Error:', error);
      reject(error);
    });

    // Send empty body to trigger reload
    req.write(JSON.stringify({}));
    req.end();
  });
}

async function main() {
  console.log('════════════════════════════════════════');
  console.log('  SUPABASE SCHEMA CACHE REFRESH');
  console.log('════════════════════════════════════════\n');

  try {
    await reloadSchema();
  } catch (err) {
    console.error('Failed to reload schema:', err.message);
  }

  console.log('\n💡 Alternative methods to refresh schema:');
  console.log('   1. Go to Supabase Dashboard > Settings > API');
  console.log('   2. Click "Reload Schema Cache"');
  console.log('   3. Or wait for automatic refresh (typically 2-5 minutes)\n');
}

main();
