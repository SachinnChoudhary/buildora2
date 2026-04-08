import { NextResponse } from 'next/server';
import crypto from 'crypto';

const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || 'TEST_DUMMY_SECRET';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const ts = request.headers.get('x-webhook-timestamp');
    const signature = request.headers.get('x-webhook-signature');

    if (!ts || !signature || !rawBody) {
      return NextResponse.json({ error: 'Missing signature, timestamp, or payload' }, { status: 400 });
    }

    const stringToHash = ts + rawBody;
    const expectedSignature = crypto.createHmac('sha256', CASHFREE_SECRET_KEY).update(stringToHash).digest('base64');

    if (signature !== expectedSignature) {
      console.error('Cashfree webhook signature mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);

    if (payload.type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const merchantTransactionId = payload.data.order.order_id;
      const orderId = merchantTransactionId.startsWith('TXN_') ? merchantTransactionId.replace('TXN_', '') : merchantTransactionId;

      console.log(`✅ Cashfree Payment succeeded for order ${orderId}`);

      if (orderId && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
        const { getAdminDb } = await import('@/lib/firebase-admin');
        const db = getAdminDb();
        await db.collection('orders').doc(orderId).update({
          status: 'completed',
          cashfreeTransactionId: payload.data.payment.cf_payment_id,
          completedAt: new Date().toISOString(),
        });
        console.log(`📦 Order ${orderId} marked as completed in Firestore`);
      }
    } else {
       console.log(`Cashfree Payment event: ${payload.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Cashfree Webhook Error:', error.message);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 500 });
  }
}
