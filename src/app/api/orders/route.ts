import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || 'TEST_DUMMY_ID';
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || 'TEST_DUMMY_SECRET';
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'SANDBOX';
const CASHFREE_HOST = CASHFREE_ENV === 'PROD' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';
// Mock orders store for local fallback
const mockOrders: Array<{
  id: string;
  userId: string;
  projectId: string;
  amount: number;
  status: string;
  createdAt: string;
}> = [];

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
      const snapshot = await adminDb.collection('orders').where('userId', '==', userId).get();
      const userOrders = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      return NextResponse.json({ success: true, data: userOrders });
    } catch (error) {
      console.error('Error fetching orders from Firestore:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
    }
  }

  // Fallback to mock
  const userOrders = mockOrders.filter(o => o.userId === userId);
  return NextResponse.json({ success: true, data: userOrders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, projectId, amount } = body;

    if (!userId || !projectId || !amount) {
      return NextResponse.json(
        { success: false, error: 'userId, projectId, and amount are required' },
        { status: 400 }
      );
    }

    // Use Cashfree and Firestore if configured
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      const { getAdminDb } = await import('@/lib/firebase-admin');
      const adminDb = getAdminDb();

      // 1. Create order in Firestore (status: pending)
      const orderIdNumber = Math.floor(100000 + Math.random() * 900000);
      const customOrderId = `BUILD-${Date.now().toString().slice(-4)}${orderIdNumber.toString().slice(-2)}`;

      const { email, userName, projectTitle } = body;

      await adminDb.collection('orders').doc(customOrderId).set({
        userId,
        projectId,
        amount,
        status: 'pending',
        paymentMode: 'Cashfree',
        email: email || null,
        userName: userName || null,
        projectTitle: projectTitle || null,
        createdAt: new Date().toISOString(),
      });

      const transactionId = customOrderId;
      const protocol = request.headers.get('x-forwarded-proto') || 'http';
      const host = request.headers.get('host') || 'localhost:3000';
      const vercelProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null;
      const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL && !process.env.NEXT_PUBLIC_BASE_URL.includes('localhost')
        ? process.env.NEXT_PUBLIC_BASE_URL
        : vercelProdUrl || vercelUrl || `${protocol}://${host}`;

      const data = {
        order_id: transactionId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: userId.substring(0, 50),
          customer_phone: "9999999999",
        },
        order_meta: {
          return_url: `${baseUrl}/api/orders/return?projectId=${projectId}&order_id={order_id}`,
          notify_url: `${baseUrl}/api/webhooks/cashfree`,
        }
      };

      const response = await fetch(`${CASHFREE_HOST}/orders`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'x-api-version': '2023-08-01',
          'x-client-id': CASHFREE_APP_ID,
          'x-client-secret': CASHFREE_SECRET_KEY
        },
        body: JSON.stringify(data),
      });

      const cfRes = await response.json();
      
      if (cfRes.payment_session_id) {
        return NextResponse.json({ success: true, data: { id: customOrderId, paymentSessionId: cfRes.payment_session_id, env: CASHFREE_ENV } }, { status: 201 });
      } else {
        throw new Error(cfRes.message || 'Cashfree payment initiation failed');
      }
    }

    // --- MOCK FALLBACK ---
    const mockOrderIdNumber = Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      id: `BUILD-${Date.now().toString().slice(-4)}${mockOrderIdNumber.toString().slice(-2)}`,
      userId,
      projectId,
      amount,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };
    mockOrders.push(newOrder);

    // Instead of a Stripe URL, return a mock success URL for local dev
    return NextResponse.json({ 
      success: true, 
      data: { 
        id: newOrder.id, 
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/projects/${projectId}?success=true` 
      } 
    }, { status: 201 });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Checkout session creation failed' 
      },
      { status: 500 }
    );
  }
}
