import { NextResponse } from 'next/server';
import crypto from 'crypto';

const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const xVerify = request.headers.get('x-verify');
    const base64Payload = body.response;

    if (!xVerify || !base64Payload) {
      return NextResponse.json({ error: 'Missing signature or payload' }, { status: 400 });
    }

    const stringToHash = base64Payload + PHONEPE_SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const expectedVerify = `${sha256}###${PHONEPE_SALT_INDEX}`;

    if (xVerify !== expectedVerify) {
      console.error('PhonePe webhook signature mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payloadString = Buffer.from(base64Payload, 'base64').toString('utf-8');
    const payload = JSON.parse(payloadString);

    if (payload.code === 'PAYMENT_SUCCESS') {
      const merchantTransactionId = payload.data.merchantTransactionId;
      const orderId = merchantTransactionId.replace('TXN_', '');

      console.log(`✅ PhonePe Payment succeeded for order ${orderId}`);

      if (orderId && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
        const { getAdminDb } = await import('@/lib/firebase-admin');
        const db = getAdminDb();
        await db.collection('orders').doc(orderId).update({
          status: 'completed',
          phonepeTransactionId: payload.data.transactionId,
          completedAt: new Date().toISOString(),
        });
        console.log(`📦 Order ${orderId} marked as completed in Firestore`);
      }
    } else {
       console.log(`PhonePe Payment not successful. Code: ${payload.code}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('PhonePe Webhook Error:', error.message);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 500 });
  }
}
