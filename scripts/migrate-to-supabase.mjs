import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
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

// 1. Init Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: `${env.FIREBASE_PROJECT_ID}.appspot.com`
    });
  } catch (err) {
    console.error('Firebase Admin Init Failed:', err.message);
    process.exit(1);
  }
}

async function migrate() {
  const db = admin.firestore();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('\n🚢 STARTING MIGRATION FROM FIREBASE TO SUPABASE...');
  console.log('----------------------------------------------------');

  try {
    const snapshot = await db.collection('projects').get();
    console.log(`🔍 Found ${snapshot.size} projects in Firestore.`);

    const projectsToInsert = snapshot.docs.map(doc => {
      const p = doc.data();
      return {
        title: p.title,
        subtitle: p.subtitle,
        domain: p.domain,
        difficulty: p.difficulty,
        price: p.price,
        original_price: p.originalPrice || (p.price * 3),
        tech_stack: p.techStack || [],
        tags: p.tags || [],
        description: p.description,
        features: p.features || [],
        includes: p.includes || [],
        thumbnail_url: p.thumbnailUrl || (p.thumbnail ? `https://storage.googleapis.com/${env.FIREBASE_PROJECT_ID}.appspot.com/${p.thumbnail}` : ''),
        source_url: p.sourceUrl || '',
        status: 'active',
        visibility: 'public',
        featured: p.featured || false,
        file_tree: JSON.stringify(p.fileTree || [])
      };
    });

    console.log('📤 Sending data to Supabase Postgres (REST)...');
    
    // We use standard fetch to talk to Supabase's PostgREST API
    const response = await fetch(`${supabaseUrl}/rest/v1/projects`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(projectsToInsert)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase API failed: ${response.status} ${errorText}`);
    }

    console.log(`✅ SUCCESS! Ported ${projectsToInsert.length} projects to Supabase.`);
    console.log('----------------------------------------------------');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ MIGRATION ERROR:', err.message);
    process.exit(1);
  }
}

migrate();
