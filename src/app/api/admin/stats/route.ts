import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  let totalProjects = 0;
  let totalRevenue = 0;
  let totalOrders = 0;
  let totalUsers = 0;
  let pendingCustomRequests = 0;

  // Get project count from Supabase (where projects actually live)
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { count, error } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });
      if (!error && count !== null) {
        totalProjects = count;
      }
    } catch (e) {
      console.error('Error counting projects from Supabase:', e);
    }
  }

  // Get orders, users, custom requests from Firestore
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      const { getAdminDb } = await import('@/lib/firebase-admin');
      const adminDb = getAdminDb();
      
      const [ordersSnap, usersSnap, customRequestsSnap] = await Promise.all([
        adminDb.collection('orders').get(),
        adminDb.collection('users').get(),
        adminDb.collection('project_requests').get()
      ]);

      totalRevenue = ordersSnap.docs.reduce((sum, doc) => {
        const order = doc.data();
        return sum + (order.status === 'completed' ? (order.amount || 0) : 0);
      }, 0);

      totalOrders = ordersSnap.size;
      totalUsers = usersSnap.size;
      pendingCustomRequests = customRequestsSnap.docs.filter(d => d.data().status === 'pending').length;

      // Fallback: if Supabase project count failed, try Firestore 
      if (totalProjects === 0) {
        const projectsSnap = await adminDb.collection('projects').get();
        totalProjects = projectsSnap.size;
      }

      return NextResponse.json({
        success: true,
        stats: { totalRevenue, totalOrders, totalUsers, totalProjects, pendingCustomRequests }
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
      totalRevenue: 0,
      totalOrders: 0,
      totalUsers: 0,
      totalProjects,
      pendingCustomRequests: 0
    }
  });
}
