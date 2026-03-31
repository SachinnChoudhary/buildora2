import { NextResponse } from 'next/server';
import { getProjectById } from '@/lib/projects';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  // Use Firestore if configured
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

  // Fallback to local
  const project = getProjectById(id);
  if (project) {
    return NextResponse.json({ success: true, data: project });
  }

  return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
}
