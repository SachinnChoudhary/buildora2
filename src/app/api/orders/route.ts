import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';
const PHONEPE_ENV = process.env.PHONEPE_ENV || 'UAT';
const PHONEPE_HOST = PHONEPE_ENV === 'PROD' ? 'https://api.phonepe.com/apis/hermes' : 'https://api-preprod.phonepe.com/apis/pg-sandbox';
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

    // Use PhonePe and Firestore if configured
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
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

      const transactionId = `TXN_${orderRef.id}`;
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

      const data = {
        merchantId: PHONEPE_MERCHANT_ID,
        merchantTransactionId: transactionId,
        merchantUserId: userId,
        amount: amount * 100, // Amount in paise
        redirectUrl: `${baseUrl}/projects/${projectId}?success=true`,
        redirectMode: 'REDIRECT',
        callbackUrl: `${baseUrl}/api/webhooks/phonepe`,
        mobileNumber: '9999999999',
        paymentInstrument: {
          type: 'PAY_PAGE',
        },
      };

      const payload = JSON.stringify(data);
      const base64Payload = Buffer.from(payload).toString('base64');
      const apiEndpoint = '/pg/v1/pay';

      const stringToHash = base64Payload + apiEndpoint + PHONEPE_SALT_KEY;
      const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
      const xVerify = `${sha256}###${PHONEPE_SALT_INDEX}`;

      const response = await fetch(`${PHONEPE_HOST}${apiEndpoint}`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
        },
        body: JSON.stringify({
          request: base64Payload,
        }),
      });

      const phonePeRes = await response.json();
      
      if (phonePeRes.success && phonePeRes.data?.instrumentResponse?.redirectInfo?.url) {
        return NextResponse.json({ success: true, data: { id: orderRef.id, url: phonePeRes.data.instrumentResponse.redirectInfo.url } }, { status: 201 });
      } else {
        throw new Error(phonePeRes.message || 'PhonePe payment initiation failed');
      }
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
