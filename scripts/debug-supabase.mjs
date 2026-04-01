import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) {
    console.error(`ERROR: .env.local not found at ${envPath}`);
    process.exit(1);
  }
  
  const content = readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    if (line.trim().startsWith('#') || !line.trim()) return;
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
  return env;
}

const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function runDebug() {
  console.log('🔍 Starting Supabase Comprehensive Debug...');
  console.log('🔗 URL:', env.NEXT_PUBLIC_SUPABASE_URL);
  
  // 1. Basic Connection Check
  console.log('\nStep 1: Pinging Auth service...');
  const { data: authData, error: authError } = await supabase.auth.getSession();
  if (authError) {
    console.error('❌ AUTH ERROR:', authError.message);
  } else {
    console.log('✅ AUTH OK: Connection to Supabase is active.');
  }

  // 2. Fetch Projects Count
  console.log('\nStep 2: Testing READ on "projects" table...');
  const { data: selectData, error: selectError, count } = await supabase
    .from('projects')
    .select('*', { count: 'exact' });
  
  if (selectError) {
    console.error('❌ READ ERROR:', selectError.message);
    if (selectError.message.includes('not found')) {
      console.warn('💡 Tip: The table "projects" MIGHT NOT exist yet. Check your SQL Editor.');
    }
  } else {
    console.log(`✅ READ OK: Successfully fetched ${count} projects.`);
  }

  // 3. Test a dummy INSERT
  console.log('\nStep 3: Testing INSERT on "projects" table...');
  const dummyId = '77777777-7777-7777-7777-777777777777';
  const { data: insertData, error: insertError } = await supabase
    .from('projects')
    .insert([{
      id: dummyId,
      title: 'DIAGNOSTIC TEST PROJECT',
      price: 0,
      visibility: 'public',
      status: 'active'
    }])
    .select();
  
  if (insertError) {
    console.error('❌ INSERT ERROR:', insertError.message);
    console.error('Full Error Object:', JSON.stringify(insertError, null, 2));
    if (insertError.message.includes('row-level security')) {
      console.warn('💡 Tip: RLS IS STILL BLOCKING. Ensure you have run my "Nuclear SQL" fix.');
    }
  } else {
    console.log('✅ INSERT OK: Diagnostics insert worked correctly!');
    // Cleanup
    await supabase.from('projects').delete().eq('id', dummyId);
    console.log('✅ Cleanup: Diagnostic project removed.');
  }

  // 4. Test Storage Check
  console.log('\nStep 4: Testing STORAGE "projects" bucket...');
  const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('projects');
  if (bucketError) {
    console.error('❌ STORAGE ERROR:', bucketError.message);
    if (bucketError.message.includes('not found')) {
      console.warn('💡 Tip: Create a bucket named "projects" in Storage dashboard.');
    }
  } else {
    console.log(`✅ STORAGE OK: Bucket "projects" is visible and ${bucketData.public ? 'Public' : 'PRIVATE (Please change to Public)'}.`);
  }

  console.log('\n🏁 Debug Finished.');
  process.exit(0);
}

runDebug();
