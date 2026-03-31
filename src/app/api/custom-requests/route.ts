import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'userId is required' },
      { status: 400 }
    );
  }

  // Use Firestore if configured
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      const { getAdminDb } = await import('@/lib/firebase-admin');
      const adminDb = getAdminDb();
      const snapshot = await adminDb.collection('custom_requests').where('userId', '==', userId).get();
      const userRequests = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      return NextResponse.json({ success: true, data: userRequests });
    } catch (error) {
      console.error('Error fetching custom requests from Firestore:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch requests' }, { status: 500 });
    }
  }

  // Fallback to empty mock
  return NextResponse.json({ success: true, data: [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, title, requirements, budget, deadline, techStack, contactName, whatsapp, email, institution } = body;

    if (!userId || !title || !requirements) {
      return NextResponse.json(
        { success: false, error: 'userId, title, and requirements are required' },
        { status: 400 }
      );
    }

    const requestData = {
      userId,
      title,
      requirements,
      budget: budget || 'Flexible',
      deadline: deadline || 'No deadline',
      techStack: techStack || [],
      contactName: contactName || 'Not provided',
      whatsapp: whatsapp || 'Not provided',
      email: email || 'Not provided',
      institution: institution || 'Not provided',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Use Firestore if configured
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      const { getAdminDb } = await import('@/lib/firebase-admin');
      const adminDb = getAdminDb();
      const requestRef = await adminDb.collection('custom_requests').add(requestData);
      return NextResponse.json({ success: true, data: { id: requestRef.id, ...requestData } }, { status: 201 });
    }

    // Mock Fallback
    return NextResponse.json({ 
      success: true, 
      data: { 
        id: `cr_${Date.now()}`, 
        ...requestData 
      } 
    }, { status: 201 });

  } catch (error) {
    console.error('Custom request error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit custom request' },
      { status: 500 }
    );
  }
}
