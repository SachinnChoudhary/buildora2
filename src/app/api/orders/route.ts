import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// Initialize Stripe if key is present
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-03-31.basil' as any,
}) : null;

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

    // Use Stripe and Firestore if configured
    if (stripe && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      const { getAdminDb } = await import('@/lib/firebase-admin');
      const adminDb = getAdminDb();

      // 1. Create order in Firestore (status: pending)
      const orderRef = await adminDb.collection('orders').add({
        userId,
        projectId,
        amount,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      // 2. Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: `Project: ${projectId}`,
                description: 'Full source code access',
              },
              unit_amount: amount * 100, // Stripe uses cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/projects/${projectId}?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/projects/${projectId}?canceled=true`,
        metadata: {
          orderId: orderRef.id,
          userId,
          projectId,
        },
      });

      return NextResponse.json({ success: true, data: { id: orderRef.id, url: session.url } }, { status: 201 });
    }

    // --- MOCK FALLBACK ---
    const newOrder = {
      id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
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
      { success: false, error: 'Checkout session creation failed' },
      { status: 500 }
    );
  }
}
