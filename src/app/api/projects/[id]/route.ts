import { NextResponse } from 'next/server';
import { getProjectById } from '@/lib/projects';
import { mapSupabaseProject } from '@/lib/supabaseHelpers';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  // Priority 1: Use Supabase (Postgres)
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const { supabase } = await import('@/lib/supabase');
      // Note: Using .eq() + [0] instead of .single() to avoid stale cache issues
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id);

      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, data: mapSupabaseProject(data[0]) });
      }
    } catch (error) {
      console.error('Error fetching project from Supabase:', error);
    }
  }

  // Priority 2: Use Firestore if configured
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      const { getAdminDb } = await import('@/lib/firebase-admin');
      const adminDb = getAdminDb();
      const doc = await adminDb.collection('projects').doc(id).get();
      
      if (doc.exists) {
        return NextResponse.json({ success: true, data: { id: doc.id, ...doc.data() } });
      }
    } catch (error) {
      console.error('Error fetching project from Firestore:', error);
    }
  }

  // Priority 3: Fallback to local hardcoded DB
  const project = getProjectById(id);
  if (project) {
    return NextResponse.json({ success: true, data: project });
  }

  return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
}
