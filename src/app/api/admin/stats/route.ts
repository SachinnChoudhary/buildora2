import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Use Firestore if configured
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      const { getAdminDb } = await import('@/lib/firebase-admin');
      const adminDb = getAdminDb();
      
      // Fetch counts and aggregations
      const [projectsSnap, ordersSnap, usersSnap, customRequestsSnap] = await Promise.all([
        adminDb.collection('projects').get(),
        adminDb.collection('orders').get(),
        adminDb.collection('users').get(),
        adminDb.collection('project_requests').get()
      ]);

      const totalRevenue = ordersSnap.docs.reduce((sum, doc) => {
        const order = doc.data();
        return sum + (order.status === 'completed' ? (order.amount || 0) : 0);
      }, 0);

      // Return real-world data
      return NextResponse.json({
        success: true,
        stats: {
          totalRevenue,
          totalOrders: ordersSnap.size,
          totalUsers: usersSnap.size,
          totalProjects: projectsSnap.size,
          pendingCustomRequests: customRequestsSnap.docs.filter(d => d.data().status === 'pending').length
        }
      });
    } catch (error) {
      console.error('Admin stats error:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch admin stats' }, { status: 500 });
    }
  }

  // Fallback to mock for local dev if DB isn't ready
  return NextResponse.json({
    success: true,
    stats: {
      totalRevenue: 24500,
      totalOrders: 12,
      totalUsers: 128,
      totalProjects: 8,
      pendingCustomRequests: 3
    }
  });
}
