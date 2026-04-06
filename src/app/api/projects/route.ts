import { NextResponse } from 'next/server';
import { filterProjects } from '@/lib/projects';
import { mapSupabaseProject } from '@/lib/supabaseHelpers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain') || undefined;
  const difficulty = searchParams.get('difficulty') || undefined;
  const featured = searchParams.get('featured') === 'true' || undefined;
  const search = searchParams.get('q') || undefined;

  let projects = [];

  // Priority 1: Use Supabase (Postgres)
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const { supabase } = await import('@/lib/supabase');
      let query = supabase.from('projects').select('*');

      if (domain && domain !== 'All') query = query.eq('domain', domain);
      if (difficulty && difficulty !== 'All') query = query.eq('difficulty', difficulty);
      if (featured) query = query.eq('featured', true);
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      // Map snake_case to camelCase for UI compatibility
      projects = (data || []).map(mapSupabaseProject);

      if (search) {
        const lowerQ = search.toLowerCase();
        projects = projects.filter((p: any) => 
          p.title?.toLowerCase().includes(lowerQ) || 
          p.techStack?.some((t: string) => t.toLowerCase().includes(lowerQ))
        );
      }
      
      return NextResponse.json({ success: true, count: projects.length, data: projects });
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to Firebase:', e);
    }
  }

  // Priority 2: Legacy fallback to Firebase
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      const { getAdminDb } = await import('@/lib/firebase-admin');
      const adminDb = getAdminDb();
      let queryRef: FirebaseFirestore.Query = adminDb.collection('projects');
      
      if (domain && domain !== 'All') {
        queryRef = queryRef.where('domain', '==', domain);
      }
      if (difficulty && difficulty !== 'All') {
        queryRef = queryRef.where('difficulty', '==', difficulty);
      }
      if (featured) {
        queryRef = queryRef.where('featured', '==', true);
      }

      const snapshot = await queryRef.get();
      projects = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));

      // Handle simple string searching since Firestore full-text search is limited
      if (search) {
        const lowerQ = search.toLowerCase();
        projects = projects.filter(p => 
          p.title?.toLowerCase().includes(lowerQ) || 
          p.techStack?.some((t: string) => t.toLowerCase().includes(lowerQ))
        );
      }
    } catch (error) {
      console.error('Error fetching projects from Firestore:', error);
      // Fallback to local filtering
      projects = filterProjects({ domain, difficulty, featured, search });
    }
  } else {
    projects = filterProjects({ domain, difficulty, featured, search });
  }

  return NextResponse.json({
    success: true,
    count: projects.length,
    data: projects,
  });
}
